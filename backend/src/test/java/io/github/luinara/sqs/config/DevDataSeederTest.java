package io.github.luinara.sqs.config;

import io.github.luinara.sqs.authentication.AuthenticationService;
import io.github.luinara.sqs.pokemon.PokemonRepository;
import io.github.luinara.sqs.task.TaskRepository;
import io.github.luinara.sqs.task.UserTaskRepository;
import io.github.luinara.sqs.task.entity.TaskEntity;
import io.github.luinara.sqs.user.UserEntity;
import io.github.luinara.sqs.user.UserRepository;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;

import java.time.OffsetDateTime;
import java.util.Optional;

import static org.assertj.core.api.Assertions.assertThat;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.anyInt;
import static org.mockito.ArgumentMatchers.anyString;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;

@ExtendWith(MockitoExtension.class)
class DevDataSeederTest {

    @Mock
    private AuthenticationService authenticationService;

    @Mock
    private UserRepository userRepository;

    @Mock
    private TaskRepository taskRepository;

    @Mock
    private UserTaskRepository userTaskRepository;

    @Mock
    private PokemonRepository pokemonRepository;

    @Test
    void run_resetsExistingDemoUserToStableDemoState() {
        UserEntity user = dirtyDemoUser();
        when(pokemonRepository.findById(anyInt())).thenReturn(Optional.empty());
        when(taskRepository.findByTitle(anyString())).thenReturn(Optional.empty());
        when(taskRepository.save(any(TaskEntity.class))).thenAnswer(invocation -> invocation.getArgument(0));
        when(userRepository.findByUsernameIgnoreCase("demo")).thenReturn(Optional.of(user));

        DevDataSeeder seeder = new DevDataSeeder(
                authenticationService,
                userRepository,
                taskRepository,
                userTaskRepository,
                pokemonRepository
        );
        seeder.run(null);

        assertThat(new BCryptPasswordEncoder().matches("password123", user.getPasswordHash())).isTrue();
        assertThat(user.getCurrentPokemonId()).isEqualTo(1);
        assertThat(user.isEgg()).isTrue();
        assertThat(user.getHydrationMl()).isZero();
        assertThat(user.getHappiness()).isEqualTo(60);
        assertThat(user.getPokemonLevel()).isEqualTo(1);
        assertThat(user.getPokemonXp()).isZero();
        assertThat(user.getPendingFeedPoints()).isZero();
        assertThat(user.getLastLevelUpAt()).isNull();
        assertThat(user.getHatchedAt()).isNull();
        verify(userTaskRepository).deleteByUserId(42L);
        verify(userRepository).save(user);
    }

    private static UserEntity dirtyDemoUser() {
        UserEntity user = new UserEntity("demo", "old-hash");
        user.setId(42L);
        user.setCurrentPokemonId(null);
        user.setEgg(false);
        user.setHydrationMl(3000);
        user.setHappiness(80);
        user.setPokemonLevel(18);
        user.setPokemonXp(90);
        user.setPendingFeedPoints(40);
        user.setLastLevelUpAt(OffsetDateTime.now());
        user.setHatchedAt(OffsetDateTime.now());
        return user;
    }
}
