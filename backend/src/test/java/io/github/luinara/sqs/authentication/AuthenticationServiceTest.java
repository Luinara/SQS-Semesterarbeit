package io.github.luinara.sqs.authentication;

import io.github.luinara.sqs.user.UserEntity;
import io.github.luinara.sqs.user.UserRepository;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.ArgumentCaptor;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.dao.DataIntegrityViolationException;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;

import java.time.OffsetDateTime;
import java.time.ZoneOffset;
import java.util.Optional;

import static org.assertj.core.api.Assertions.assertThat;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.*;
import static org.junit.jupiter.api.Assertions.*;

@ExtendWith(MockitoExtension.class)
class AuthenticationServiceTest {

    private AuthenticationService authService;

    @Mock
    UserRepository repo;

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
    void login_blocksUserAfterRepeatedFailures() {
        authService.createUser("carol", "secret123");

        for (int index = 0; index < 5; index += 1) {
            assertThat(authService.login("carol", "wrongpass")).isEmpty();
        }

        assertThat(authService.login("carol", "secret123")).isEmpty();
    }

    @Test
    void login_successClearsPreviousFailures() {
        authService.createUser("carol", "secret123");

        assertThat(authService.login("carol", "wrongpass")).isEmpty();
        assertThat(authService.login("carol", "secret123")).isPresent();

        for (int index = 0; index < 4; index += 1) {
            assertThat(authService.login("carol", "wrongpass")).isEmpty();
        }

        assertThat(authService.login("carol", "secret123")).isPresent();
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

    @Test
    void inMemory_createLoginLogoutFlow() {
        AuthenticationService svc = new AuthenticationService();

        boolean created = svc.createUser("alice", "password123");
        assertThat(created).isTrue();

        Optional<String> tokenOpt = svc.login("alice", "password123");
        assertThat(tokenOpt).isPresent();

        String token = tokenOpt.get();
        Optional<String> validated = svc.validateToken(token);
        assertThat(validated).contains("alice");

        svc.logout(token);
        assertThat(svc.validateToken(token)).isEmpty();
    }

    @Test
    void inMemory_duplicateCreateReturnsFalse() {
        AuthenticationService svc = new AuthenticationService();

        boolean first = svc.createUser("bob", "password123");
        boolean second = svc.createUser("bob", "password123");

        assertThat(first).isTrue();
        assertThat(second).isFalse();
    }

    @Test
    void db_createUser_whenExists_returnsFalse() {
        when(repo.existsByUsernameIgnoreCase("charlie")).thenReturn(true);

        AuthenticationService svc = new AuthenticationService(Optional.of(repo));
        boolean created = svc.createUser("charlie", "password123");

        assertThat(created).isFalse();
        verify(repo, never()).save(any());
    }

    @Test
    void db_createUser_raceConstraint_returnsFalse() {
        when(repo.existsByUsernameIgnoreCase("dave")).thenReturn(false);
        when(repo.save(any())).thenThrow(new DataIntegrityViolationException("unique"));

        AuthenticationService svc = new AuthenticationService(Optional.of(repo));
        boolean created = svc.createUser("dave", "password123");

        assertThat(created).isFalse();
        verify(repo).save(any());
    }

    @Test
    void db_login_updatesLastLogin() {
        BCryptPasswordEncoder enc = new BCryptPasswordEncoder();
        String hash = enc.encode("password123");

        UserEntity entity = new UserEntity("eve", hash);
        when(repo.findByUsernameIgnoreCase("eve")).thenReturn(Optional.of(entity));

        AuthenticationService svc = new AuthenticationService(Optional.of(repo));
        Optional<String> res = svc.login("eve", "password123");

        assertThat(res).isPresent();

        ArgumentCaptor<UserEntity> captor = ArgumentCaptor.forClass(UserEntity.class);
        verify(repo).save(captor.capture());
        UserEntity saved = captor.getValue();
        assertThat(saved.getLastLoginAt()).isNotNull();
        assertThat(saved.getLastLoginAt()).isBeforeOrEqualTo(OffsetDateTime.now());
    }

    @Test
    void db_login_incrementsStreak_whenLastLoginWasYesterday() {
        BCryptPasswordEncoder enc = new BCryptPasswordEncoder();
        String hash = enc.encode("password123");

        UserEntity entity = new UserEntity("frank", hash);
        entity.setStreak(2);
        entity.setLastLoginAt(OffsetDateTime.now(ZoneOffset.UTC).minusDays(1));
        when(repo.findByUsernameIgnoreCase("frank")).thenReturn(Optional.of(entity));

        AuthenticationService svc = new AuthenticationService(Optional.of(repo));
        Optional<String> res = svc.login("frank", "password123");

        assertThat(res).isPresent();

        ArgumentCaptor<UserEntity> captor = ArgumentCaptor.forClass(UserEntity.class);
        verify(repo).save(captor.capture());
        UserEntity saved = captor.getValue();
        assertThat(saved.getStreak()).isEqualTo(3);
    }

    @Test
    void db_login_resetsStreak_whenLastLoginOlderThanYesterday() {
        BCryptPasswordEncoder enc = new BCryptPasswordEncoder();
        String hash = enc.encode("password123");

        UserEntity entity = new UserEntity("grace", hash);
        entity.setStreak(5);
        entity.setLastLoginAt(OffsetDateTime.now(ZoneOffset.UTC).minusDays(3));
        when(repo.findByUsernameIgnoreCase("grace")).thenReturn(Optional.of(entity));

        AuthenticationService svc = new AuthenticationService(Optional.of(repo));
        Optional<String> res = svc.login("grace", "password123");

        assertThat(res).isPresent();

        ArgumentCaptor<UserEntity> captor = ArgumentCaptor.forClass(UserEntity.class);
        verify(repo).save(captor.capture());
        UserEntity saved = captor.getValue();
        assertThat(saved.getStreak()).isEqualTo(1);
    }

    @Test
    void login_withNullUsernameOrPassword_returnsEmpty() {
        AuthenticationService svc = new AuthenticationService();
        Optional<String> r1 = svc.login(null, "pw");
        Optional<String> r2 = svc.login("user", null);
        assertTrue(r1.isEmpty());
        assertTrue(r2.isEmpty());
    }

    @Test
    void login_withEmptyUsernameOrPassword_returnsEmpty_whenNoSuchUser() {
        AuthenticationService svc = new AuthenticationService();
        // no user created for empty username -> should return empty
        Optional<String> r1 = svc.login("", "pw");
        Optional<String> r2 = svc.login("user", "");
        assertTrue(r1.isEmpty());
        assertTrue(r2.isEmpty());
    }
}
