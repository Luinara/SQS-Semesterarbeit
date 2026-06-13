package io.github.luinara.sqs.task;

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

    public TaskService(TaskRepository taskRepository,
                       UserTaskRepository userTaskRepository,
                       UserRepository userRepository)
    {
        this.taskRepository = taskRepository;
        this.userTaskRepository = userTaskRepository;
        this.userRepository = userRepository;
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
        int increment = totalTasks > 0 ? Math.round(100.0f / totalTasks) : 0;
        int newHappiness = Math.min(100, user.getHappiness() + increment);

        // Growth and level logic
        int growthIncrease = 10; // configurable later
        int newXp = user.getPokemonXp() + growthIncrease;
        int levelUps = newXp / 100;
        int newLevel = user.getPokemonLevel() + levelUps;
        newXp = newXp % 100;

        user.setHappiness(newHappiness);
        user.setPokemonXp(newXp);
        user.setPokemonLevel(newLevel);
        userRepository.save(user);

        // Build GameStateDto-like result (minimal)
        var dto = new io.github.luinara.sqs.user.dto.GameStateDto();
        dto.setWaterLevel(user.getHydrationMl());
        dto.setFoodLevel(user.getHunger());
        dto.setPokemonImageUrl(null);
        dto.setPokemonLevel(user.getPokemonLevel());
        dto.setGrowth(user.getPokemonXp());
        dto.setHappiness(user.getHappiness());
        dto.setTasks(List.of());
        dto.setStreak(user.getStreak());
        dto.setYesterdayLoggedIn(false);
        dto.setServerNow(OffsetDateTime.now(ZoneOffset.UTC).toString());

        return new GameStateResult(200, "ok", dto);
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
