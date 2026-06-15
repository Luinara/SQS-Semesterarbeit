package io.github.luinara.sqs.user;

import io.github.luinara.sqs.pokemon.PokemonRepository;
import io.github.luinara.sqs.task.TaskRepository;
import io.github.luinara.sqs.task.TaskService;
import io.github.luinara.sqs.task.UserTaskRepository;
import io.github.luinara.sqs.user.dto.GameStateDto;
import io.github.luinara.sqs.user.dto.TaskCompletionDto;
import org.springframework.dao.DataAccessException;
import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.OffsetDateTime;
import java.time.ZoneOffset;
import java.util.List;
import java.util.Map;
import java.util.Optional;
import java.util.stream.Collectors;

@Service
public class UserService {

    private static final String WATER_TASK_TITLE = "Wasser trinken";
    private static final int WATER_GOAL_ML = 3000;

    private final UserRepository userRepository;
    private final PokemonRepository pokemonRepository;
    private final TaskRepository taskRepository;
    private final UserTaskRepository userTaskRepository;
    private final JdbcTemplate jdbcTemplate;
    private final TaskService taskService;

    public UserService(
            UserRepository userRepository,
            PokemonRepository pokemonRepository,
            TaskRepository taskRepository,
            UserTaskRepository userTaskRepository,
            JdbcTemplate jdbcTemplate,
            TaskService taskService
    ) {
        this.userRepository = userRepository;
        this.pokemonRepository = pokemonRepository;
        this.taskRepository = taskRepository;
        this.userTaskRepository = userTaskRepository;
        this.jdbcTemplate = jdbcTemplate;
        this.taskService = taskService;
    }

    public GameStateDto getGameStateForUsername(String username) {
        Optional<UserEntity> opt = userRepository.findByUsernameIgnoreCase(username);
        if (opt.isEmpty()) {
            return null; // caller should handle null -> 401 or 404
        }
        UserEntity user = opt.get();
        GameStateDto dto = new GameStateDto();
        dto.setWaterLevel(user.getHydrationMl());
        dto.setFoodLevel(user.getHunger());

        // determine image: if egg -> egg image placeholder, else pokemon image
        if (user.isEgg()) {
            dto.setPokemonImageUrl("/assets/egg.png");
        } else {
            Integer pId = user.getCurrentPokemonId();
            if (pId != null) {
                var pOpt = pokemonRepository.findById(pId);
                dto.setPokemonImageUrl(pOpt.map(p -> p.getImageUrl()).orElse(null));
            } else {
                dto.setPokemonImageUrl(null);
            }
        }

        dto.setPokemonLevel(user.getPokemonLevel());
        dto.setGrowth(user.getPokemonXp());
        dto.setHappiness(user.getHappiness());
        dto.setPendingFeedPoints(user.getPendingFeedPoints());
        dto.setTasks(buildTaskCompletions(user));
        dto.setStreak(user.getStreak());
        // yesterdayLoggedIn helper: compute from lastLoginAt
        OffsetDateTime last = user.getLastLoginAt();
        OffsetDateTime now = OffsetDateTime.now(ZoneOffset.UTC);
        boolean yesterdayLoggedIn = false;
        if (last != null) {
            // if last login falls on previous UTC day
            if (last.withOffsetSameInstant(ZoneOffset.UTC).toLocalDate().isEqual(now.toLocalDate().minusDays(1))) {
                yesterdayLoggedIn = true;
            }
        }
        dto.setYesterdayLoggedIn(yesterdayLoggedIn);
        dto.setServerNow(now.toString());
        return dto;
    }

    private List<TaskCompletionDto> buildTaskCompletions(UserEntity user) {
        Map<Long, Boolean> completedByTaskId = userTaskRepository.findByUserId(user.getId()).stream()
                .collect(Collectors.toMap(
                        userTask -> userTask.getTaskId(),
                        userTask -> userTask.isCompleted(),
                        (first, second) -> first || second
                ));

        return taskRepository.findAll().stream()
                .map(task -> new TaskCompletionDto(
                        task.getId(),
                        task.getTitle(),
                        completedByTaskId.getOrDefault(task.getId(), false)
                ))
                .collect(Collectors.toList());
    }

    @Transactional
    public GameStateDto waterUser(String username, int ml) {
        var opt = userRepository.findByUsernameIgnoreCase(username);
        if (opt.isEmpty()) return null;
        UserEntity user = opt.get();
        user.setHydrationMl(user.getHydrationMl() + ml);
        userRepository.save(user);
        completeWaterTaskIfReady(user);
        return getGameStateForUsername(username);
    }

    private void completeWaterTaskIfReady(UserEntity user) {
        if (user.getHydrationMl() < WATER_GOAL_ML) {
            return;
        }

        taskRepository.findByTitle(WATER_TASK_TITLE)
                .ifPresent(task -> taskService.completeTaskForUserEntity(user, task));
    }

    public GameStateDto feedUser(String username) {
        var opt = userRepository.findByUsernameIgnoreCase(username);
        if (opt.isEmpty()) return null;
        UserEntity user = opt.get();
        int pending = user.getPendingFeedPoints();
        if (pending <= 0) return getGameStateForUsername(username);
        int needed = 100 - user.getHappiness();
        int toApply = Math.min(needed, pending);
        user.setHappiness(Math.min(100, user.getHappiness() + toApply));
        user.setPendingFeedPoints(pending - toApply);
        userRepository.save(user);
        return getGameStateForUsername(username);
    }

    @Transactional
    public GameStateDto testLevelUp(String username) {
        var opt = userRepository.findByUsernameIgnoreCase(username);
        if (opt.isEmpty()) return null;

        UserEntity user = opt.get();
        int oldLevel = user.getPokemonLevel();
        int newLevel = oldLevel + 1;
        OffsetDateTime now = OffsetDateTime.now(ZoneOffset.UTC);

        user.setPokemonLevel(newLevel);
        user.setPokemonXp(0);
        user.setLastLevelUpAt(now);

        if (user.isEgg() && newLevel >= 10) {
            user.setEgg(false);
            user.setHatchedAt(now);
        }

        if (oldLevel < 25 && newLevel >= 25) {
            attemptEvolution(user);
        }
        if (oldLevel < 50 && newLevel >= 50) {
            attemptEvolution(user);
        }

        userRepository.save(user);
        return getGameStateForUsername(username);
    }

    @Transactional
    public boolean deleteAccount(String username) {
        var opt = userRepository.findByUsernameIgnoreCase(username);
        if (opt.isEmpty()) return false;

        UserEntity user = opt.get();
        Long userId = user.getId();

        userTaskRepository.deleteByUserId(userId);
        deleteUserStatsIfPresent(userId);
        userRepository.delete(user);

        return true;
    }

    private void deleteUserStatsIfPresent(Long userId) {
        try {
            Boolean tableExists = jdbcTemplate.queryForObject(
                    "SELECT COUNT(*) > 0 FROM information_schema.tables WHERE LOWER(table_name) = 'user_stats'",
                    Boolean.class
            );

            if (Boolean.TRUE.equals(tableExists)) {
                jdbcTemplate.update("DELETE FROM user_stats WHERE user_id = ?", userId);
            }
        } catch (DataAccessException ignored) {
            // The Spring JPA test schema does not always include the Prisma-owned stats table.
        }
    }

    private void attemptEvolution(UserEntity user) {
        Integer currentId = user.getCurrentPokemonId();
        if (currentId == null) return;

        pokemonRepository.findById(currentId)
                .map(pokemon -> pokemon.getEvolutionId())
                .ifPresent(user::setCurrentPokemonId);
    }
}
