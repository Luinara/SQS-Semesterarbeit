package io.github.luinara.sqs.authentication;

import org.springframework.stereotype.Service;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.security.crypto.password.PasswordEncoder;

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

    public AuthenticationService() {
        // ...existing code... (constructor)
    }

    /**
     * Create a new user. Returns true when created, false when username already exists.
     */
    public boolean createUser(String username, String password) {
        if (username == null || username.trim().isEmpty() || password == null) {
            throw new InvalidRequestException("username and password must be provided");
        }
        String key = username.toLowerCase();
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
        String storedHash = users.get(key);
        if (storedHash == null) {
            return Optional.empty();
        }
        if (passwordEncoder.matches(password, storedHash)) {
            String token = UUID.randomUUID().toString();
            sessions.put(token, key);
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
