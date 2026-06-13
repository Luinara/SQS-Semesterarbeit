package io.github.luinara.sqs.user;

import io.github.luinara.sqs.user.dto.GameStateDto;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import java.time.OffsetDateTime;
import java.time.ZoneOffset;
import java.util.Optional;

import static org.assertj.core.api.Assertions.assertThat;
import static org.mockito.Mockito.when;

@ExtendWith(MockitoExtension.class)
class UserServiceTest {

    @Mock
    private UserRepository userRepository;

    @InjectMocks
    private UserService userService;

    private OffsetDateTime nowUtc;

    @BeforeEach
    void setUp() {
        nowUtc = OffsetDateTime.now(ZoneOffset.UTC);
    }

    @Test
    void getGameState_mapsFieldsCorrectly_and_setsYesterdayLoggedInTrue() {
        UserEntity entity = new UserEntity();
        entity.setUsername("testuser");
        entity.setHydrationMl(120);
        entity.setHunger(50);
        entity.setPokemonLevel(5);
        entity.setPokemonXp(42);
        entity.setHappiness(7);
        entity.setStreak(3);
        entity.setLastLoginAt(nowUtc.minusDays(1)); // yesterday

        when(userRepository.findByUsernameIgnoreCase("testuser")).thenReturn(Optional.of(entity));

        GameStateDto dto = userService.getGameStateForUsername("testuser");

        assertThat(dto).isNotNull();
        assertThat(dto.getWaterLevel()).isEqualTo(120);
        assertThat(dto.getFoodLevel()).isEqualTo(50);
        assertThat(dto.getPokemonLevel()).isEqualTo(5);
        assertThat(dto.getGrowth()).isEqualTo(42);
        assertThat(dto.getHappiness()).isEqualTo(7);
        assertThat(dto.getStreak()).isEqualTo(3);
        assertThat(dto.isYesterdayLoggedIn()).isTrue();
        assertThat(dto.getServerNow()).isNotNull();
    }

    @Test
    void getGameState_setsYesterdayLoggedInFalse_whenLastLoginOlder() {
        UserEntity entity = new UserEntity();
        entity.setUsername("olduser");
        entity.setHydrationMl(10);
        entity.setHunger(5);
        entity.setPokemonLevel(1);
        entity.setPokemonXp(5);
        entity.setHappiness(1);
        entity.setStreak(1);
        entity.setLastLoginAt(nowUtc.minusDays(2)); // older than yesterday

        when(userRepository.findByUsernameIgnoreCase("olduser")).thenReturn(Optional.of(entity));

        GameStateDto dto = userService.getGameStateForUsername("olduser");

        assertThat(dto).isNotNull();
        assertThat(dto.isYesterdayLoggedIn()).isFalse();
    }
}
