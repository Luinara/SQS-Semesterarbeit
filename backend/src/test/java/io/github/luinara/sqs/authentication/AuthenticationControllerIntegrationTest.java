package io.github.luinara.sqs.authentication;

import com.fasterxml.jackson.databind.ObjectMapper;
import io.github.luinara.sqs.user.UserEntity;
import io.github.luinara.sqs.user.UserRepository;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.AutoConfigureMockMvc;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.http.MediaType;
import org.springframework.test.context.ActiveProfiles;
import org.springframework.test.web.servlet.MockMvc;
import org.springframework.test.web.servlet.MvcResult;
import org.springframework.mock.web.MockHttpSession;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;

import java.time.OffsetDateTime;
import java.util.Map;

import static org.assertj.core.api.Assertions.assertThat;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

@SpringBootTest
@AutoConfigureMockMvc
@ActiveProfiles("test")
class AuthenticationControllerIntegrationTest {

    @Autowired
    private MockMvc mockMvc;

    @Autowired
    private UserRepository userRepository;

    private final ObjectMapper om = new ObjectMapper();

    @BeforeEach
    void clean() {
        userRepository.deleteAll();
    }

    @Test
    void signupCreatesUserAndAssignsPokemon() throws Exception {
        String body = om.writeValueAsString(Map.of("username", "newuser", "password", "password123"));

        mockMvc.perform(post("/api/auth/signup")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(body))
                .andExpect(status().isCreated());

        var opt = userRepository.findByUsernameIgnoreCase("newuser");
        assertThat(opt).isPresent();
        UserEntity u = opt.get();
        assertThat(u.getCurrentPokemonId()).isNotNull();
        assertThat(u.getCurrentPokemonId()).isBetween(1, 151);
        assertThat(u.isEgg()).isTrue();
        assertThat(u.getHappiness()).isEqualTo(0);
    }

    @Test
    void loginUpdatesLastLogin() throws Exception {
        BCryptPasswordEncoder enc = new BCryptPasswordEncoder();
        String hash = enc.encode("mypassword");
        UserEntity entity = new UserEntity("loginuser", hash);
        entity.setCreatedAt(OffsetDateTime.now());
        userRepository.save(entity);

        String body = om.writeValueAsString(Map.of("username", "loginuser", "password", "mypassword"));

        mockMvc.perform(post("/api/auth/login")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(body))
                .andExpect(status().isOk());

        var refreshed = userRepository.findByUsernameIgnoreCase("loginuser");
        assertThat(refreshed).isPresent();
        assertThat(refreshed.get().getLastLoginAt()).isNotNull();
    }

    @Test
    void loginWithInvalidCredentialsReturnsUnauthorized() throws Exception {
        BCryptPasswordEncoder enc = new BCryptPasswordEncoder();
        String hash = enc.encode("rightpass");
        UserEntity entity = new UserEntity("badlogin", hash);
        entity.setCreatedAt(OffsetDateTime.now());
        userRepository.save(entity);

        String body = om.writeValueAsString(Map.of("username", "badlogin", "password", "wrongpass"));

        mockMvc.perform(post("/api/auth/login")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(body))
                .andExpect(status().isUnauthorized());
    }

    @Test
    void logoutInvalidatesSession() throws Exception {
        // create user and login to obtain session
        BCryptPasswordEncoder enc = new BCryptPasswordEncoder();
        String hash = enc.encode("logoutpass");
        UserEntity entity = new UserEntity("tologout", hash);
        entity.setCreatedAt(OffsetDateTime.now());
        userRepository.save(entity);

        String body = om.writeValueAsString(Map.of("username", "tologout", "password", "logoutpass"));

        MvcResult result = mockMvc.perform(post("/api/auth/login")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(body))
                .andExpect(status().isOk())
                .andReturn();

        MockHttpSession session = (MockHttpSession) result.getRequest().getSession(false);
        assertThat(session).isNotNull();

        mockMvc.perform(post("/api/auth/logout").session(session))
                .andExpect(status().isNoContent());

        // subsequent logout with same session should still succeed (idempotent)
        mockMvc.perform(post("/api/auth/logout").session(session))
                .andExpect(status().isNoContent());
    }
}
