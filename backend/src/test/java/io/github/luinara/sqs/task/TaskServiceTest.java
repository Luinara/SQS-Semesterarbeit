package io.github.luinara.sqs.task;

import io.github.luinara.sqs.task.entity.TaskEntity;
import io.github.luinara.sqs.task.entity.UserTaskEntity;
import io.github.luinara.sqs.user.UserEntity;
import io.github.luinara.sqs.user.UserRepository;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.ArgumentCaptor;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.mockito.junit.jupiter.MockitoSettings;
import org.mockito.quality.Strictness;

import java.time.Clock;
import java.time.Instant;
import java.util.List;
import java.util.Optional;
import java.time.ZoneOffset;

import static org.assertj.core.api.Assertions.assertThat;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
@MockitoSettings(strictness = Strictness.LENIENT)
class TaskServiceTest {

    @Mock
    private TaskRepository taskRepository;

    @Mock
    private UserTaskRepository userTaskRepository;

    @Mock
    private UserRepository userRepository;

    @Mock
    private io.github.luinara.sqs.pokemon.PokemonRepository pokemonRepository;

    @Mock
    private Clock clock;

    @InjectMocks
    private TaskService taskService;

    private UserEntity user;
    private Instant now;

    @BeforeEach
    void setUp() {
        user = new UserEntity();
        user.setId(1L);
        user.setUsername("tester");
        user.setHappiness(0);
        user.setPokemonLevel(1);
        user.setPokemonXp(0);
        user.setHydrationMl(50);
        user.setHunger(50);
        now = Instant.parse("2026-06-15T10:00:00Z");
        when(clock.instant()).thenReturn(now);
        when(clock.getZone()).thenReturn(ZoneOffset.UTC);
    }

    @Test
    void completeTask_success_appliesEffects() {
        when(userRepository.findByUsernameIgnoreCase("tester")).thenReturn(Optional.of(user));

        TaskEntity task = new TaskEntity();
        task.setId(2L);
        task.setTitle("Do something");
        task.setFeedPoints(5);
        when(taskRepository.findById(2L)).thenReturn(Optional.of(task));

        when(userTaskRepository.findByUserIdAndTaskId(1L, 2L)).thenReturn(Optional.empty());
        when(taskRepository.count()).thenReturn(5L);

        GameStateResult res = taskService.completeTaskForUser("tester", 2L);

        assertThat(res.status).isEqualTo(200);
        assertThat(res.gameState).isNotNull();
        // tasks grant feedPoints (5) so pendingFeedPoints increased accordingly
        assertThat(res.gameState.getPendingFeedPoints()).isEqualTo(5);
        // xp increased by 10
        assertThat(res.gameState.getGrowth()).isEqualTo(10);

        // verify user saved
        ArgumentCaptor<UserEntity> captor = ArgumentCaptor.forClass(UserEntity.class);
        verify(userRepository).save(captor.capture());
        UserEntity saved = captor.getValue();
        assertThat(saved.getPendingFeedPoints()).isEqualTo(5);
        assertThat(saved.getPokemonXp()).isEqualTo(10);
    }

    @Test
    void completeTask_whenEggStillSet_returnsSelectedPokemonImageAndName() {
        user.setEgg(true);
        user.setCurrentPokemonId(7);

        io.github.luinara.sqs.pokemon.PokemonEntity pokemon = new io.github.luinara.sqs.pokemon.PokemonEntity();
        pokemon.setId(7);
        pokemon.setName("squirtle");
        pokemon.setImageUrl("/img/squirtle.png");

        when(userRepository.findByUsernameIgnoreCase("tester")).thenReturn(Optional.of(user));
        when(pokemonRepository.findById(7)).thenReturn(Optional.of(pokemon));

        TaskEntity task = new TaskEntity();
        task.setId(9L);
        when(taskRepository.findById(9L)).thenReturn(Optional.of(task));
        when(userTaskRepository.findByUserIdAndTaskId(1L, 9L)).thenReturn(Optional.empty());

        GameStateResult res = taskService.completeTaskForUser("tester", 9L);

        assertThat(res.status).isEqualTo(200);
        assertThat(res.gameState).isNotNull();
        assertThat(res.gameState.getCurrentPokemonId()).isEqualTo(7);
        assertThat(res.gameState.isEgg()).isTrue();
        assertThat(res.gameState.getPokemonName()).isNull();
        assertThat(res.gameState.getPokemonImageUrl()).isEqualTo("/assets/egg.png");
    }

    @Test
    void completeTask_alreadyCompleted_returns409() {
        when(userRepository.findByUsernameIgnoreCase("tester")).thenReturn(Optional.of(user));

        TaskEntity task = new TaskEntity();
        task.setId(3L);
        when(taskRepository.findById(3L)).thenReturn(Optional.of(task));

        UserTaskEntity ute = new UserTaskEntity();
        ute.setUserId(1L);
        ute.setTaskId(3L);
        ute.setCompleted(true);
        when(userTaskRepository.findByUserIdAndTaskId(1L, 3L)).thenReturn(Optional.of(ute));

        GameStateResult res = taskService.completeTaskForUser("tester", 3L);
        assertThat(res.status).isEqualTo(409);
    }

    @Test
    void completeTask_taskNotFound_returns404() {
        when(userRepository.findByUsernameIgnoreCase("tester")).thenReturn(Optional.of(user));
        when(taskRepository.findById(99L)).thenReturn(Optional.empty());

        GameStateResult res = taskService.completeTaskForUser("tester", 99L);
        assertThat(res.status).isEqualTo(404);
    }

    @Test
    void completeTask_userNotFound_returns404() {
        when(userRepository.findByUsernameIgnoreCase("unknown")).thenReturn(Optional.empty());

        GameStateResult res = taskService.completeTaskForUser("unknown", 1L);
        assertThat(res.status).isEqualTo(404);
    }

    @Test
    void completeTask_hatchesEgg_atLevel10() {
        when(userRepository.findByUsernameIgnoreCase("tester")).thenReturn(Optional.of(user));

        TaskEntity task = new TaskEntity();
        task.setId(4L);
        when(taskRepository.findById(4L)).thenReturn(Optional.of(task));

        when(userTaskRepository.findByUserIdAndTaskId(1L, 4L)).thenReturn(Optional.empty());
        when(taskRepository.count()).thenReturn(1L);

        // set user as egg and level 9 so one completion levels to 10
        user.setEgg(true);
        user.setPokemonLevel(9);
        user.setPokemonXp(95); // +10 -> full growth -> level up to 10

        GameStateResult res = taskService.completeTaskForUser("tester", 4L);
        assertThat(res.status).isEqualTo(200);
        assertThat(res.gameState).isNotNull();
        // user should have hatched
        assertThat(user.isEgg()).isFalse();
        assertThat(user.getHatchedAt()).isNotNull();
        assertThat(user.getLastLevelUpAt()).isNotNull();
    }

    @Test
    void completeTask_evolvesAtLevel15() {
        when(userRepository.findByUsernameIgnoreCase("tester")).thenReturn(Optional.of(user));

        TaskEntity task = new TaskEntity();
        task.setId(5L);
        when(taskRepository.findById(5L)).thenReturn(Optional.of(task));

        when(userTaskRepository.findByUserIdAndTaskId(1L, 5L)).thenReturn(Optional.empty());
        when(taskRepository.count()).thenReturn(1L);

        // set up user current pokemon id and a pokemon with evolution
        user.setPokemonLevel(14);
        user.setPokemonXp(95); // +10 => level 15
        user.setCurrentPokemonId(100);

        io.github.luinara.sqs.pokemon.PokemonEntity p100 = new io.github.luinara.sqs.pokemon.PokemonEntity();
        p100.setId(100);
        p100.setName("Proto");
        p100.setEvolutionId(101);
        io.github.luinara.sqs.pokemon.PokemonEntity p101 = new io.github.luinara.sqs.pokemon.PokemonEntity();
        p101.setId(101);
        p101.setName("Evo1");
        p101.setEvolutionId(null);

        when(pokemonRepository.findById(100)).thenReturn(Optional.of(p100));
        when(pokemonRepository.findById(101)).thenReturn(Optional.of(p101));

        GameStateResult res = taskService.completeTaskForUser("tester", 5L);
        assertThat(res.status).isEqualTo(200);
        // after evolution, currentPokemonId should be 101
        assertThat(user.getCurrentPokemonId()).isEqualTo(101);
    }

    @Test
    void completeTask_evolvesAtLevel35() {
        when(userRepository.findByUsernameIgnoreCase("tester")).thenReturn(Optional.of(user));

        TaskEntity task = new TaskEntity();
        task.setId(6L);
        when(taskRepository.findById(6L)).thenReturn(Optional.of(task));

        when(userTaskRepository.findByUserIdAndTaskId(1L, 6L)).thenReturn(Optional.empty());
        when(taskRepository.count()).thenReturn(1L);

        user.setPokemonLevel(34);
        user.setPokemonXp(95);
        user.setCurrentPokemonId(200);

        io.github.luinara.sqs.pokemon.PokemonEntity p200 = new io.github.luinara.sqs.pokemon.PokemonEntity();
        p200.setId(200);
        p200.setEvolutionId(201);
        io.github.luinara.sqs.pokemon.PokemonEntity p201 = new io.github.luinara.sqs.pokemon.PokemonEntity();
        p201.setId(201);
        p201.setEvolutionId(null);

        when(pokemonRepository.findById(200)).thenReturn(Optional.of(p200));
        when(pokemonRepository.findById(201)).thenReturn(Optional.of(p201));

        GameStateResult res = taskService.completeTaskForUser("tester", 6L);
        assertThat(res.status).isEqualTo(200);
        assertThat(user.getCurrentPokemonId()).isEqualTo(201);
    }

    @Test
    void completeTask_levelUpBlockedWithinTwoDays_keepsGrowthAtCap() {
        when(userRepository.findByUsernameIgnoreCase("tester")).thenReturn(Optional.of(user));

        TaskEntity task = new TaskEntity();
        task.setId(7L);
        when(taskRepository.findById(7L)).thenReturn(Optional.of(task));

        when(userTaskRepository.findByUserIdAndTaskId(1L, 7L)).thenReturn(Optional.empty());
        user.setPokemonLevel(3);
        user.setPokemonXp(95);
        user.setLastLevelUpAt(java.time.OffsetDateTime.parse("2026-06-14T10:00:00Z"));

        GameStateResult res = taskService.completeTaskForUser("tester", 7L);

        assertThat(res.status).isEqualTo(200);
        assertThat(user.getPokemonLevel()).isEqualTo(3);
        assertThat(user.getPokemonXp()).isEqualTo(100);
        assertThat(user.getLastLevelUpAt()).isEqualTo(java.time.OffsetDateTime.parse("2026-06-14T10:00:00Z"));
    }

    @Test
    void completeTask_levelUpAfterTwoDays_setsLastLevelUpAt() {
        when(userRepository.findByUsernameIgnoreCase("tester")).thenReturn(Optional.of(user));

        TaskEntity task = new TaskEntity();
        task.setId(8L);
        when(taskRepository.findById(8L)).thenReturn(Optional.of(task));

        when(userTaskRepository.findByUserIdAndTaskId(1L, 8L)).thenReturn(Optional.empty());
        user.setPokemonLevel(3);
        user.setPokemonXp(100);
        user.setLastLevelUpAt(java.time.OffsetDateTime.parse("2026-06-13T10:00:00Z"));

        GameStateResult res = taskService.completeTaskForUser("tester", 8L);

        assertThat(res.status).isEqualTo(200);
        assertThat(user.getPokemonLevel()).isEqualTo(4);
        assertThat(user.getPokemonXp()).isEqualTo(0);
        assertThat(user.getLastLevelUpAt()).isEqualTo(java.time.OffsetDateTime.parse("2026-06-15T10:00:00Z"));
    }
}
