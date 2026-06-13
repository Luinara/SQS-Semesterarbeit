package io.github.luinara.sqs.user;

import io.github.luinara.sqs.user.dto.GameStateDto;
import io.github.luinara.sqs.user.dto.TaskCompletionDto;
import org.springframework.stereotype.Service;

import java.time.OffsetDateTime;
import java.time.ZoneOffset;
import java.util.ArrayList;
import java.util.List;
import java.util.Optional;

@Service
public class UserService {

    private final UserRepository userRepository;

    public UserService(UserRepository userRepository) {
        this.userRepository = userRepository;
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
        // no Pokemon entity mapped yet -> leave null or implement lookup later
        dto.setPokemonImageUrl(null);
        dto.setPokemonLevel(user.getPokemonLevel());
        dto.setGrowth(user.getPokemonXp());
        dto.setHappiness(user.getHappiness());
        // tasks not implemented in this iteration -> return empty list
        List<TaskCompletionDto> tasks = new ArrayList<>();
        dto.setTasks(tasks);
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
}
