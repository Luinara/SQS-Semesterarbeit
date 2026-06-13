package io.github.luinara.sqs.user;

import com.fasterxml.jackson.databind.ObjectMapper;
import io.github.luinara.sqs.authentication.AuthenticationService;
import io.github.luinara.sqs.user.dto.GameStateDto;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.WebMvcTest;
import org.springframework.boot.test.mock.mockito.MockBean;
import org.springframework.mock.web.MockHttpSession;
import org.springframework.test.context.junit.jupiter.SpringExtension;
import org.springframework.test.web.servlet.MockMvc;

import java.util.Map;
import java.util.Optional;

import static org.mockito.Mockito.when;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

@ExtendWith(SpringExtension.class)
@WebMvcTest(controllers = UserController.class)
@DisplayName("UserController Tests")
class UserControllerTest {

    @Autowired
    private MockMvc mockMvc;

    @MockBean
    private UserService userService;

    @MockBean
    private AuthenticationService authenticationService;

    @Autowired
    private ObjectMapper om;

    @Test
    void water_requiresAuth() throws Exception {
        mockMvc.perform(post("/api/user/water").contentType("application/json").content("{\"ml\":10}"))
                .andExpect(status().isUnauthorized());
    }

    @Test
    void feed_requiresAuth() throws Exception {
        mockMvc.perform(post("/api/user/feed"))
                .andExpect(status().isUnauthorized());
    }

    @Test
    void water_success_returnsGameState() throws Exception {
        when(authenticationService.validateToken("t")).thenReturn(Optional.of("tester"));
        MockHttpSession session = new MockHttpSession();
        session.setAttribute("USER_TOKEN", "t");

        GameStateDto dto = new GameStateDto();
        dto.setWaterLevel(100);
        when(userService.waterUser("tester", 10)).thenReturn(dto);

        mockMvc.perform(post("/api/user/water").session(session).contentType("application/json").content("{\"ml\":10}"))
                .andExpect(status().isOk());
    }

    @Test
    void feed_success_returnsGameState() throws Exception {
        when(authenticationService.validateToken("t")).thenReturn(Optional.of("tester"));
        MockHttpSession session = new MockHttpSession();
        session.setAttribute("USER_TOKEN", "t");

        GameStateDto dto = new GameStateDto();
        dto.setHappiness(50);
        when(userService.feedUser("tester")).thenReturn(dto);

        mockMvc.perform(post("/api/user/feed").session(session))
                .andExpect(status().isOk());
    }
}
