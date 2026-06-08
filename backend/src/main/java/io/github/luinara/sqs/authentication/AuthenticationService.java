package io.github.luinara.sqs.authentication;

import org.springframework.stereotype.Service;

import java.util.Optional;

/**
 * Authentication service stub — implement authentication logic here.
 *
 * This class is intentionally minimal to serve as a placeholder while the
 * real authentication implementation is worked on. Methods return safe,
 * non-exceptional defaults to satisfy architecture tests.
 */
@Service
public class AuthenticationService {

    public AuthenticationService() {
        // ...existing code... (constructor)
    }

    /**
     * Authenticate a user with username and password.
     * Returns an Optional token (empty when authentication is not implemented).
     */
    public Optional<String> login(String username, String password) {
        // TODO: implement authentication and return a token or session id
        return Optional.empty();
    }

    /**
     * Logout the current user / invalidate token.
     * Current stub is a no-op.
     */
    public void logout(String token) {
        // TODO: implement logout / token invalidation
        // no-op for now
    }

    /**
     * Validate a token and return the associated username if valid.
     */
    public Optional<String> validateToken(String token) {
        // TODO: implement token validation
        return Optional.empty();
    }
}
