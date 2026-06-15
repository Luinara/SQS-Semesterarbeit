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

import static org.assertj.core.api.Assertions.assertThat;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.delete;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.content;
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
    void testLevelUp_requiresAuth() throws Exception {
        mockMvc.perform(post("/api/user/test-level-up"))
                .andExpect(status().isUnauthorized())
                .andExpect(content().json("{\"error\":\"unauthenticated\"}"));
    }

    @Test
    void water_requiresAuth_returnsJsonErrorBody() throws Exception {
        mockMvc.perform(post("/api/user/water").contentType("application/json").content("{\"ml\":10}"))
                .andExpect(status().isUnauthorized())
                .andExpect(content().json("{\"error\":\"unauthenticated\"}"));
    }

    @Test
    void feed_requiresAuth_returnsJsonErrorBody() throws Exception {
        mockMvc.perform(post("/api/user/feed"))
                .andExpect(status().isUnauthorized())
                .andExpect(content().json("{\"error\":\"unauthenticated\"}"));
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

    @Test
    void testLevelUp_success_returnsGameState() throws Exception {
        when(authenticationService.validateToken("t")).thenReturn(Optional.of("tester"));
        MockHttpSession session = new MockHttpSession();
        session.setAttribute("USER_TOKEN", "t");

        GameStateDto dto = new GameStateDto();
        dto.setPokemonLevel(8);
        when(userService.testLevelUp("tester")).thenReturn(dto);

        mockMvc.perform(post("/api/user/test-level-up").session(session))
                .andExpect(status().isOk());

        verify(userService).testLevelUp("tester");
    }

    @Test
    void testLevelUp_userNotFound_returns404() throws Exception {
        when(authenticationService.validateToken("t")).thenReturn(Optional.of("tester"));
        MockHttpSession session = new MockHttpSession();
        session.setAttribute("USER_TOKEN", "t");
        when(userService.testLevelUp("tester")).thenReturn(null);

        mockMvc.perform(post("/api/user/test-level-up").session(session))
                .andExpect(status().isNotFound())
                .andExpect(content().json("{\"error\":\"user not found\"}"));
    }

    @Test
    void deleteAccount_requiresAuth_returnsJsonErrorBody() throws Exception {
        mockMvc.perform(delete("/api/user/account"))
                .andExpect(status().isUnauthorized())
                .andExpect(content().json("{\"error\":\"unauthenticated\"}"));
    }

    @Test
    void deleteAccount_authenticated_deletesUserAndInvalidatesSession() throws Exception {
        when(authenticationService.validateToken("t")).thenReturn(Optional.of("tester"));
        when(userService.deleteAccount("tester")).thenReturn(true);
        MockHttpSession session = new MockHttpSession();
        session.setAttribute("USER_TOKEN", "t");

        mockMvc.perform(delete("/api/user/account").session(session))
                .andExpect(status().isNoContent());

        verify(userService).deleteAccount("tester");
        verify(authenticationService).logout("t");
        assertThat(session.isInvalid()).isTrue();
    }

    @Test
    void getGameState_withoutSession_returns401_andUnauthenticatedBody() throws Exception {
        mockMvc.perform(get("/api/user/game-state"))
                .andExpect(status().isUnauthorized())
                .andExpect(content().string("unauthenticated"));
    }

    @Test
    void getGameState_withInvalidSessionAttribute_returns401_andUnauthenticatedBody() throws Exception {
        MockHttpSession session = new MockHttpSession();
        // set attribute to non-string value
        session.setAttribute("USER_TOKEN", 12345);

        mockMvc.perform(get("/api/user/game-state").session(session))
                .andExpect(status().isUnauthorized())
                .andExpect(content().string("unauthenticated"));
    }

    @Test
    void getGameState_authenticated_butUserNotFound_returns404() throws Exception {
        when(authenticationService.validateToken("t")).thenReturn(Optional.of("tester"));
        MockHttpSession session = new MockHttpSession();
        session.setAttribute("USER_TOKEN", "t");

        when(userService.getGameStateForUsername("tester")).thenReturn(null);

        mockMvc.perform(get("/api/user/game-state").session(session))
                .andExpect(status().isNotFound())
                .andExpect(content().string("user not found"));
    }

    @Test
    void getGameState_authenticated_returnsDtoJson() throws Exception {
        when(authenticationService.validateToken("t")).thenReturn(Optional.of("tester"));
        MockHttpSession session = new MockHttpSession();
        session.setAttribute("USER_TOKEN", "t");

        GameStateDto dto = new GameStateDto();
        dto.setHappiness(77);
        when(userService.getGameStateForUsername("tester")).thenReturn(dto);

        mockMvc.perform(get("/api/user/game-state").session(session))
                .andExpect(status().isOk())
                .andExpect(content().contentTypeCompatibleWith("application/json"));
    }
}
