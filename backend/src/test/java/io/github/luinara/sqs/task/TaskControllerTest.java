package io.github.luinara.sqs.task;

import com.fasterxml.jackson.databind.ObjectMapper;
import io.github.luinara.sqs.authentication.AuthenticationService;
import io.github.luinara.sqs.task.dto.TaskPublicDto;
import io.github.luinara.sqs.user.UserEntity;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.Mock;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.WebMvcTest;
import org.springframework.boot.test.mock.mockito.MockBean;
import org.springframework.http.MediaType;
import org.springframework.test.context.junit.jupiter.SpringExtension;
import org.springframework.test.web.servlet.MockMvc;
import org.springframework.test.web.servlet.MvcResult;
import org.springframework.mock.web.MockHttpSession;

import java.time.OffsetDateTime;
import java.util.List;
import java.util.Map;
import java.util.Optional;

import static org.mockito.Mockito.when;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.*;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.*;
import static org.junit.jupiter.api.Assertions.assertTrue;

@ExtendWith(SpringExtension.class)
@WebMvcTest(controllers = TaskController.class)
@DisplayName("TaskController Tests")
class TaskControllerTest {

    @Autowired
    private MockMvc mockMvc;

    @MockBean
    private TaskService taskService;

    @MockBean
    private AuthenticationService authenticationService;

    @Autowired
    private ObjectMapper om;

    @Test
    void getTasks_returns200AndList() throws Exception {
        when(taskService.findAllTasks()).thenReturn(List.of(new TaskPublicDto(1L, "t1", "d1")));

        mockMvc.perform(get("/api/tasks"))
                .andExpect(status().isOk())
                .andExpect(content().contentTypeCompatibleWith(MediaType.APPLICATION_JSON));
    }

    @Test
    void completeTask_requiresAuth() throws Exception {
        mockMvc.perform(post("/api/tasks/1/complete"))
                .andExpect(status().isUnauthorized());
    }

    @Test
    void completeTask_success_returnsGameState() throws Exception {
        // setup session
        UserEntity user = new UserEntity();
        user.setUsername("tester");
        when(authenticationService.validateToken("token123")).thenReturn(Optional.of("tester"));

        // mock service result
        var dto = new io.github.luinara.sqs.user.dto.GameStateDto();
        dto.setHappiness(10);
        GameStateResult res = new GameStateResult(200, "ok", dto);
        when(taskService.completeTaskForUser("tester", 1L)).thenReturn(res);

        MockHttpSession session = new MockHttpSession();
        session.setAttribute("USER_TOKEN", "token123");

        MvcResult mvc = mockMvc.perform(post("/api/tasks/1/complete").session(session))
                .andExpect(status().isOk())
                .andReturn();

        String body = mvc.getResponse().getContentAsString();
        Map map = om.readValue(body, Map.class);
        assertTrue(Boolean.TRUE.equals(map.get("success")));
    }
}
