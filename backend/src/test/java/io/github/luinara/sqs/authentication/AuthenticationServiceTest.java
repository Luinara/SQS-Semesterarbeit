package io.github.luinara.sqs.authentication;

import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;

import java.util.Optional;

import static org.junit.jupiter.api.Assertions.*;

class AuthenticationServiceTest {

    private AuthenticationService authService;

    @BeforeEach
    void setUp() {
        authService = new AuthenticationService();
    }

    @Test
    void createUserSuccessAndLogin() {
        boolean created = authService.createUser("alice", "password123");
        assertTrue(created, "user should be created");

        Optional<String> token = authService.login("alice", "password123");
        assertTrue(token.isPresent(), "login should succeed with correct password");
    }

    @Test
    void createDuplicateUserReturnsFalse() {
        boolean created1 = authService.createUser("bob", "password123");
        boolean created2 = authService.createUser("bob", "anotherPass");
        assertTrue(created1);
        assertFalse(created2, "creating a duplicate username should return false");
    }

    @Test
    void loginWithWrongPasswordFails() {
        authService.createUser("carol", "secret123");
        Optional<String> token = authService.login("carol", "wrongpass");
        assertTrue(token.isEmpty(), "login should fail with wrong password");
    }

    @Test
    void logoutInvalidatesToken() {
        authService.createUser("dan", "pw12345");
        Optional<String> tokenOpt = authService.login("dan", "pw12345");
        assertTrue(tokenOpt.isPresent());
        String token = tokenOpt.get();

        Optional<String> validBefore = authService.validateToken(token);
        assertTrue(validBefore.isPresent());

        authService.logout(token);

        Optional<String> validAfter = authService.validateToken(token);
        assertTrue(validAfter.isEmpty(), "token should be invalid after logout");
    }

    @Test
    void createUserInvalidArgumentsThrows() {
        assertThrows(InvalidRequestException.class, () -> authService.createUser(null, "pw"));
        assertThrows(InvalidRequestException.class, () -> authService.createUser("", "pw"));
        assertThrows(InvalidRequestException.class, () -> authService.createUser("eve", null));
    }
}
