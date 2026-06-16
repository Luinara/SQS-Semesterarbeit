package io.github.luinara.sqs.task;

import io.github.luinara.sqs.pokemon.PokemonEntity;
import io.github.luinara.sqs.pokemon.PokemonRepository;
import io.github.luinara.sqs.task.dto.TaskPublicDto;
import io.github.luinara.sqs.task.entity.TaskEntity;
import io.github.luinara.sqs.task.entity.UserTaskEntity;
import io.github.luinara.sqs.user.UserEntity;
import io.github.luinara.sqs.user.UserRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.Clock;
import java.time.Duration;
import java.time.OffsetDateTime;
import java.time.ZoneOffset;
import java.util.List;
import java.util.Optional;
import java.util.stream.Collectors;

@Service
public class TaskService {

    private static final int GROWTH_INCREASE_PER_TASK = 10;
    private static final int GROWTH_GOAL = 100;
    private static final int FIRST_EVOLUTION_LEVEL = 15;
    private static final int FINAL_EVOLUTION_LEVEL = 35;
    private static final Duration LEVEL_UP_COOLDOWN = Duration.ofDays(2);

    private final TaskRepository taskRepository;
    private final UserTaskRepository userTaskRepository;
    private final UserRepository userRepository;
    private final PokemonRepository pokemonRepository;
    private final Clock clock;

    public TaskService(TaskRepository taskRepository,
                       UserTaskRepository userTaskRepository,
                       UserRepository userRepository,
                       PokemonRepository pokemonRepository,
                       Clock clock)
    {
        this.taskRepository = taskRepository;
        this.userTaskRepository = userTaskRepository;
        this.userRepository = userRepository;
        this.pokemonRepository = pokemonRepository;
        this.clock = clock;
    }

    public List<TaskPublicDto> findAllTasks() {
        List<TaskEntity> entities = taskRepository.findAll();
        return entities.stream().map(e -> new TaskPublicDto(e.getId(), e.getTitle(), e.getDescription()))
                .collect(Collectors.toList());
    }

    public TaskPublicDto findById(Long id) {
        TaskEntity e = taskRepository.findById(id).orElse(null);
        return e == null ? null : new TaskPublicDto(e.getId(), e.getTitle(), e.getDescription());
    }

    @Transactional
    public GameStateResult completeTaskForUser(String username, Long taskId) {
        UserEntity user = userRepository.findByUsernameIgnoreCase(username).orElse(null);
        if (user == null) return new GameStateResult(404, "user not found", null);

        TaskEntity task = taskRepository.findById(taskId).orElse(null);
        if (task == null) return new GameStateResult(404, "task not found", null);

        TaskCompletionStatus completionStatus = completeTaskForUserEntity(user, task);
        if (completionStatus == TaskCompletionStatus.ALREADY_COMPLETED) {
            return new GameStateResult(409, "already completed", null);
        }

        return new GameStateResult(200, "ok", buildGameStateDto(user));
    }

    public TaskCompletionStatus completeTaskForUserEntity(UserEntity user, TaskEntity task) {
        Long taskId = task.getId();
        UserTaskEntity ute = userTaskRepository.findByUserIdAndTaskId(user.getId(), taskId)
                .orElseGet(() -> {
                    UserTaskEntity n = new UserTaskEntity();
                    n.setUserId(user.getId());
                    n.setTaskId(taskId);
                    n.setCompleted(false);
                    return n;
                });

        if (ute.isCompleted()) {
            return TaskCompletionStatus.ALREADY_COMPLETED;
        }

        ute.setCompleted(true);
        userTaskRepository.save(ute);

        int feedPoints = task.getFeedPoints() == null ? 0 : task.getFeedPoints();
        user.setPendingFeedPoints(user.getPendingFeedPoints() + feedPoints);
        applyGrowthAndLevelRules(user);
        userRepository.save(user);

        return TaskCompletionStatus.COMPLETED;
    }

    private void applyGrowthAndLevelRules(UserEntity user) {
        int oldLevel = user.getPokemonLevel();
        int newXp = Math.min(GROWTH_GOAL, user.getPokemonXp() + GROWTH_INCREASE_PER_TASK);

        if (newXp < GROWTH_GOAL || !canLevelUp(user)) {
            user.setPokemonXp(newXp);
            return;
        }

        OffsetDateTime now = OffsetDateTime.now(clock);
        int newLevel = oldLevel + 1;
        user.setPokemonXp(0);
        user.setPokemonLevel(newLevel);
        user.setLastLevelUpAt(now);

        if (user.isEgg() && newLevel >= 10) {
            user.setEgg(false);
            user.setHatchedAt(now);
        }

        if (oldLevel < FIRST_EVOLUTION_LEVEL && newLevel >= FIRST_EVOLUTION_LEVEL) {
            attemptEvolution(user);
        }
        if (oldLevel < FINAL_EVOLUTION_LEVEL && newLevel >= FINAL_EVOLUTION_LEVEL) {
            attemptEvolution(user);
        }
    }

    private boolean canLevelUp(UserEntity user) {
        OffsetDateTime lastLevelUpAt = user.getLastLevelUpAt();

        if (lastLevelUpAt == null) {
            return true;
        }

        OffsetDateTime nextAllowedLevelUp = lastLevelUpAt.plus(LEVEL_UP_COOLDOWN);
        return !OffsetDateTime.now(clock).isBefore(nextAllowedLevelUp);
    }

    private io.github.luinara.sqs.user.dto.GameStateDto buildGameStateDto(UserEntity user) {
        var dto = new io.github.luinara.sqs.user.dto.GameStateDto();
        dto.setWaterLevel(user.getHydrationMl());
        dto.setFoodLevel(user.getHunger());
        dto.setEgg(user.isEgg());

        Integer pId = user.getCurrentPokemonId();
        dto.setCurrentPokemonId(pId);
        Optional<PokemonEntity> currentPokemon = pId == null
                ? Optional.empty()
                : pokemonRepository.findById(pId);

        if (user.isEgg()) {
            dto.setPokemonImageUrl("/assets/egg.png");
        } else {
            currentPokemon.ifPresent(pokemon -> dto.setPokemonName(pokemon.getName()));
            dto.setPokemonImageUrl(currentPokemon.map(PokemonEntity::getImageUrl).orElse(null));
        }

        dto.setPokemonLevel(user.getPokemonLevel());
        dto.setGrowth(user.getPokemonXp());
        dto.setHappiness(user.getHappiness());
        dto.setPendingFeedPoints(user.getPendingFeedPoints());
        dto.setTasks(List.of());
        dto.setStreak(user.getStreak());
        dto.setYesterdayLoggedIn(false);
        dto.setServerNow(OffsetDateTime.now(clock).withOffsetSameInstant(ZoneOffset.UTC).toString());

        return dto;
    }

    private void attemptEvolution(UserEntity user) {
        Integer currentId = user.getCurrentPokemonId();
        if (currentId == null) return;
        var pOpt = pokemonRepository.findById(currentId);
        if (pOpt.isEmpty()) return;
        PokemonEntity p = pOpt.get();
        Integer evo = p.getEvolutionId();
        if (evo != null) {
            user.setCurrentPokemonId(evo);
            // optionally update pokemon entity evolution_stage if needed
        }
    }
}

enum TaskCompletionStatus {
    COMPLETED,
    ALREADY_COMPLETED
}

class GameStateResult {
    public final int status;
    public final String message;
    public final io.github.luinara.sqs.user.dto.GameStateDto gameState;

    public GameStateResult(int status, String message, io.github.luinara.sqs.user.dto.GameStateDto gameState) {
        this.status = status;
        this.message = message;
        this.gameState = gameState;
    }
}
