package io.github.luinara.sqs.task;

import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PathVariable;

import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpSession;
import java.util.List;

@RestController
@RequestMapping("/api/tasks")
public class TaskController {

    private static final String USER_TOKEN = "USER_TOKEN";

    private final TaskService taskService;
    private final io.github.luinara.sqs.authentication.AuthenticationService authenticationService;

    public TaskController(TaskService taskService,
                          io.github.luinara.sqs.authentication.AuthenticationService authenticationService) {
        this.taskService = taskService;
        this.authenticationService = authenticationService;
    }

    @GetMapping
    public ResponseEntity<List<TaskPublicDto>> getTasks() {
        List<TaskPublicDto> tasks = taskService.findAllTasks();
        return ResponseEntity.ok(tasks);
    }

    @PostMapping("/{id}/complete")
    public ResponseEntity<?> completeTask(HttpServletRequest request, @PathVariable("id") Long id) {
        HttpSession session = request.getSession(false);
        if (session == null) return ResponseEntity.status(401).body("unauthenticated");
        Object tokenOrUser = session.getAttribute(USER_TOKEN);
        if (!(tokenOrUser instanceof String)) return ResponseEntity.status(401).body("unauthenticated");
        String value = (String) tokenOrUser;
        java.util.Optional<String> maybe = authenticationService.validateToken(value);
        String username = maybe.orElse(value);

        var result = taskService.completeTaskForUser(username, id);
        if (result.status == 200) {
            return ResponseEntity.ok(java.util.Map.of("success", true, "gameState", result.gameState));
        } else if (result.status == 404) {
            return ResponseEntity.status(404).body(java.util.Map.of("error", result.message));
        } else if (result.status == 409) {
            return ResponseEntity.status(409).body(java.util.Map.of("error", result.message));
        }
        return ResponseEntity.status(500).body(java.util.Map.of("error", result.message));
    }
}
