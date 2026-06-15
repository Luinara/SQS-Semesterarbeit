package io.github.luinara.sqs.user;

import com.fasterxml.jackson.databind.ObjectMapper;
import io.github.luinara.sqs.task.TaskRepository;
import io.github.luinara.sqs.task.UserTaskRepository;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.AutoConfigureMockMvc;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.http.MediaType;
import org.springframework.mock.web.MockHttpSession;
import org.springframework.test.context.ActiveProfiles;
import org.springframework.test.web.servlet.MockMvc;
import org.springframework.test.web.servlet.MvcResult;

import java.util.Map;

import static org.assertj.core.api.Assertions.assertThat;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

@SpringBootTest
@AutoConfigureMockMvc
@ActiveProfiles("test")
@DisplayName("User Controller Integration Tests")
class UserControllerIntegrationTest {

    @Autowired
    private MockMvc mockMvc;

    @Autowired
    private ObjectMapper objectMapper;

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private UserTaskRepository userTaskRepository;

    @Autowired
    private TaskRepository taskRepository;

    @BeforeEach
    void setUp() {
        userTaskRepository.deleteAll();
        taskRepository.deleteAll();
        userRepository.deleteAll();
    }

    @Test
    @DisplayName("signup creates a database user and opens a game-state session")
    void signupCreatesDatabaseUserAndAuthenticatedGameStateSession() throws Exception {
        String body = objectMapper.writeValueAsString(Map.of(
                "username", "frontenduser",
                "password", "password123"
        ));

        MvcResult signup = mockMvc.perform(post("/api/auth/signup")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(body))
                .andExpect(status().isCreated())
                .andReturn();

        assertThat(userRepository.findByUsernameIgnoreCase("frontenduser")).isPresent();

        MockHttpSession session = (MockHttpSession) signup.getRequest().getSession(false);
        assertThat(session).isNotNull();

        mockMvc.perform(get("/api/user/game-state").session(session))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.pokemonLevel").value(1))
                .andExpect(jsonPath("$.happiness").value(0))
                .andExpect(jsonPath("$.waterLevel").value(0));
    }

    @Test
    @DisplayName("game state requires an authenticated session")
    void gameStateRequiresAuthenticatedSession() throws Exception {
        mockMvc.perform(get("/api/user/game-state"))
                .andExpect(status().isUnauthorized());
    }

    @Test
    @DisplayName("game state returns 404 when the session user no longer exists")
    void gameStateReturnsNotFoundWhenSessionUserDoesNotExist() throws Exception {
        MockHttpSession session = new MockHttpSession();
        session.setAttribute("USER_TOKEN", "missing-user");

        mockMvc.perform(get("/api/user/game-state").session(session))
                .andExpect(status().isNotFound());
    }
}
