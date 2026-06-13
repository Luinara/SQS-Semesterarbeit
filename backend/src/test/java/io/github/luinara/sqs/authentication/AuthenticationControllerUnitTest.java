package io.github.luinara.sqs.authentication;

import com.fasterxml.jackson.databind.ObjectMapper;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.http.MediaType;
import org.springframework.mock.web.MockHttpSession;
import org.springframework.test.web.servlet.MockMvc;
import org.springframework.test.web.servlet.MvcResult;
import org.springframework.test.web.servlet.setup.MockMvcBuilders;

import jakarta.servlet.http.HttpSession;
import jakarta.servlet.http.HttpServletRequest;
import java.util.Map;
import java.util.Optional;

import static org.assertj.core.api.Assertions.assertThat;
import static org.mockito.ArgumentMatchers.anyString;
import static org.mockito.Mockito.*;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

@ExtendWith(MockitoExtension.class)
class AuthenticationControllerUnitTest {

    private MockMvc mockMvc;

    @Mock
    private AuthenticationService authenticationService;

    @InjectMocks
    private AuthenticationController controller;

    private final ObjectMapper om = new ObjectMapper();

    @BeforeEach
    void setUp() {
        mockMvc = MockMvcBuilders.standaloneSetup(controller).build();
    }

    @Test
    void loginSuccess_setsSessionAndReturnsOk() throws Exception {
        String body = om.writeValueAsString(Map.of("username", "unituser", "password", "unitpass"));

        when(authenticationService.login("unituser", "unitpass")).thenReturn(Optional.of("sometoken"));

        MvcResult result = mockMvc.perform(post("/api/auth/login")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(body))
                .andExpect(status().isOk())
                .andReturn();

        HttpServletRequest req = result.getRequest();
        HttpSession session = req.getSession(false);
        assertThat(session).isNotNull();
        assertThat(session.getAttribute("USER_TOKEN")).isEqualTo("sometoken");
    }

    @Test
    void loginFailure_returnsUnauthorized() throws Exception {
        String body = om.writeValueAsString(Map.of("username", "baduser", "password", "wrongpass"));

        when(authenticationService.login("baduser", "wrongpass")).thenReturn(Optional.empty());

        MvcResult result = mockMvc.perform(post("/api/auth/login")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(body))
                .andExpect(status().isUnauthorized())
                .andReturn();

        String content = result.getResponse().getContentAsString();
        assertThat(content).contains("invalid username or password");
    }

    @Test
    void logout_withSession_callsServiceAndInvalidatesSession() throws Exception {
        MockHttpSession session = new MockHttpSession();
        session.setAttribute("USER_TOKEN", "tokentoInvalidate");

        mockMvc.perform(post("/api/auth/logout").session(session))
                .andExpect(status().isNoContent());

        verify(authenticationService, times(1)).logout("tokentoInvalidate");
        assertThat(session.isInvalid()).isTrue();
    }

    @Test
    void logout_withoutSession_doesNotCallService() throws Exception {
        mockMvc.perform(post("/api/auth/logout"))
                .andExpect(status().isNoContent());

        verify(authenticationService, never()).logout(anyString());
    }
}
