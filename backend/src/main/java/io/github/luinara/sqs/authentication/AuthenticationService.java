package io.github.luinara.sqs.authentication;

import io.github.luinara.sqs.user.UserEntity;
import io.github.luinara.sqs.user.UserRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.security.crypto.password.PasswordEncoder;

import java.time.OffsetDateTime;
import java.util.Map;
import java.util.Optional;
import java.util.UUID;
import java.util.concurrent.ConcurrentHashMap;

/**
 * Authentication service — simple in-memory implementation for development and tests.
 *
 * - Stores users in a ConcurrentHashMap with BCrypt-hashed passwords.
 * - Creates simple opaque tokens (UUID) on successful login and keeps a token->username map.
 *
 * This is intentionally simple; later this will be replaced by a persistent repository
 * (Postgres + Prisma) behind a UserRepository interface.
 */
@Service
public class AuthenticationService {

    private final Map<String, String> users = new ConcurrentHashMap<>(); // username(lowercase) -> passwordHash
    private final Map<String, String> sessions = new ConcurrentHashMap<>(); // token -> username
    private final PasswordEncoder passwordEncoder = new BCryptPasswordEncoder();

    private final UserRepository userRepository; // optional

    @Autowired
    public AuthenticationService(Optional<UserRepository> userRepository) {
        // If a JPA repository is available (e.g., when running with database profile), use it.
        this.userRepository = userRepository.orElse(null);
    }

    // Backwards-compatible no-arg constructor used by unit tests that instantiate the service directly
    public AuthenticationService() {
        this.userRepository = null;
    }

    /**
     * Create a new user. Returns true when created, false when username already exists.
     */
    public boolean createUser(String username, String password) {
        if (username == null || username.trim().isEmpty() || password == null) {
            throw new InvalidRequestException("username and password must be provided");
        }
        String key = username.toLowerCase();

        // If repository is present, persist to DB
        if (userRepository != null) {
            if (userRepository.existsByUsernameIgnoreCase(username)) {
                return false;
            }
            String hash = passwordEncoder.encode(password);
            UserEntity entity = new UserEntity(username, hash);
            entity.setCreatedAt(OffsetDateTime.now());
            userRepository.save(entity);
            return true;
        }

        // Fallback to in-memory store
        if (users.containsKey(key)) {
            return false;
        }
        String hash = passwordEncoder.encode(password);
        users.put(key, hash);
        return true;
    }

    /**
     * Authenticate a user with username and password.
     * Returns an Optional token (empty when authentication fails).
     */
    public Optional<String> login(String username, String password) {
        if (username == null || password == null) {
            return Optional.empty();
        }
        String key = username.toLowerCase();

        String storedHash = null;
        if (userRepository != null) {
            Optional<UserEntity> opt = userRepository.findByUsernameIgnoreCase(username);
            if (opt.isEmpty()) return Optional.empty();
            storedHash = opt.get().getPasswordHash();
        } else {
            storedHash = users.get(key);
            if (storedHash == null) return Optional.empty();
        }

        if (passwordEncoder.matches(password, storedHash)) {
            String token = UUID.randomUUID().toString();
            sessions.put(token, key);

            // update lastLoginAt when using DB
            if (userRepository != null) {
                Optional<UserEntity> optEntity = userRepository.findByUsernameIgnoreCase(username);
                if (optEntity.isPresent()) {
                    UserEntity entity = optEntity.get();
                    entity.setLastLoginAt(OffsetDateTime.now());
                    userRepository.save(entity);
                }
            }
            return Optional.of(token);
        }
        return Optional.empty();
    }

    /**
     * Logout the current user / invalidate token.
     */
    public void logout(String token) {
        if (token == null) return;
        sessions.remove(token);
    }

    /**
     * Validate a token and return the associated username if valid.
     */
    public Optional<String> validateToken(String token) {
        if (token == null) return Optional.empty();
        String username = sessions.get(token);
        return Optional.ofNullable(username);
    }
}
