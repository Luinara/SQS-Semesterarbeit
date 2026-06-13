package io.github.luinara.sqs.task;

import io.github.luinara.sqs.pokemon.PokemonEntity;
import io.github.luinara.sqs.pokemon.PokemonRepository;
import io.github.luinara.sqs.task.entity.TaskEntity;
import io.github.luinara.sqs.task.entity.UserTaskEntity;
import io.github.luinara.sqs.user.UserEntity;
import io.github.luinara.sqs.user.UserRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.OffsetDateTime;
import java.time.ZoneOffset;
import java.util.List;
import java.util.stream.Collectors;

@Service
public class TaskService {

    private final TaskRepository taskRepository;
    private final UserTaskRepository userTaskRepository;
    private final UserRepository userRepository;
    private final PokemonRepository pokemonRepository;

    public TaskService(TaskRepository taskRepository,
                       UserTaskRepository userTaskRepository,
                       UserRepository userRepository,
                       PokemonRepository pokemonRepository)
    {
        this.taskRepository = taskRepository;
        this.userTaskRepository = userTaskRepository;
        this.userRepository = userRepository;
        this.pokemonRepository = pokemonRepository;
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
        // find user
        UserEntity user = userRepository.findByUsernameIgnoreCase(username).orElse(null);
        if (user == null) return new GameStateResult(404, "user not found", null);

        // find task
        TaskEntity task = taskRepository.findById(taskId).orElse(null);
        if (task == null) return new GameStateResult(404, "task not found", null);

        // find or create user_task
        UserTaskEntity ute = userTaskRepository.findByUserIdAndTaskId(user.getId(), taskId)
                .orElseGet(() -> {
                    UserTaskEntity n = new UserTaskEntity();
                    n.setUserId(user.getId());
                    n.setTaskId(taskId);
                    n.setCompleted(false);
                    return n;
                });

        if (ute.isCompleted()) {
            return new GameStateResult(409, "already completed", null);
        }

        // mark completed
        ute.setCompleted(true);
        userTaskRepository.save(ute);

        // apply effects: happiness increment and growth
        int totalTasks = (int) taskRepository.count();
        int feedPoints = task.getFeedPoints() == null ? 0 : task.getFeedPoints();
        int newPendingFeed = user.getPendingFeedPoints() + feedPoints;

        // Growth and level logic
        int growthIncrease = 10; // configurable later
        int newXp = user.getPokemonXp() + growthIncrease;
        int levelUps = newXp / 100;
        int newLevel = user.getPokemonLevel() + levelUps;
        newXp = newXp % 100;

        int oldLevel = user.getPokemonLevel();

        user.setPendingFeedPoints(newPendingFeed);
        user.setPokemonXp(newXp);
        user.setPokemonLevel(newLevel);

        // Hatch logic: if was egg and now >= 10 -> hatch
        if (user.isEgg() && newLevel >= 10) {
            user.setEgg(false);
            user.setHatchedAt(OffsetDateTime.now(ZoneOffset.UTC));
        }

        // Evolution logic: attempt to evolve when crossing thresholds 25 and 50
        // We will attempt evolutions for each threshold crossed
        if (oldLevel < 25 && newLevel >= 25) {
            attemptEvolution(user);
        }
        if (oldLevel < 50 && newLevel >= 50) {
            attemptEvolution(user);
        }

        userRepository.save(user);

        // Build GameStateDto-like result (minimal)
        var dto = new io.github.luinara.sqs.user.dto.GameStateDto();
        dto.setWaterLevel(user.getHydrationMl());
        dto.setFoodLevel(user.getHunger());

        // determine image: if egg -> egg image placeholder, else pokemon image
        if (user.isEgg()) {
            dto.setPokemonImageUrl("/assets/egg.png");
        } else {
            Integer pId = user.getCurrentPokemonId();
            if (pId != null) {
                var pOpt = pokemonRepository.findById(pId);
                dto.setPokemonImageUrl(pOpt.map(PokemonEntity::getImageUrl).orElse(null));
            } else {
                dto.setPokemonImageUrl(null);
            }
        }

        dto.setPokemonLevel(user.getPokemonLevel());
        dto.setGrowth(user.getPokemonXp());
        dto.setHappiness(user.getHappiness());
        dto.setPendingFeedPoints(user.getPendingFeedPoints());
        dto.setTasks(List.of());
        dto.setStreak(user.getStreak());
        dto.setYesterdayLoggedIn(false);
        dto.setServerNow(OffsetDateTime.now(ZoneOffset.UTC).toString());

        return new GameStateResult(200, "ok", dto);
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
