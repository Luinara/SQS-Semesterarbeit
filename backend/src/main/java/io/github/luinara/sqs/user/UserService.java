package io.github.luinara.sqs.user;

import io.github.luinara.sqs.pokemon.PokemonRepository;
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
    private final PokemonRepository pokemonRepository;

    public UserService(UserRepository userRepository, PokemonRepository pokemonRepository) {
        this.userRepository = userRepository;
        this.pokemonRepository = pokemonRepository;
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

    public GameStateDto waterUser(String username, int ml) {
        var opt = userRepository.findByUsernameIgnoreCase(username);
        if (opt.isEmpty()) return null;
        UserEntity user = opt.get();
        user.setHydrationMl(user.getHydrationMl() + ml);
        userRepository.save(user);
        return getGameStateForUsername(username);
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
}
