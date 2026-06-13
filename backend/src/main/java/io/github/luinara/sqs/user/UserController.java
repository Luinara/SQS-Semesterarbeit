package io.github.luinara.sqs.user;

import io.github.luinara.sqs.authentication.AuthenticationService;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpSession;
import java.util.Optional;

@RestController
@RequestMapping("/api/user")
public class UserController {

    private static final String USER_TOKEN = "USER_TOKEN";

    private final AuthenticationService authenticationService;
    private final UserService userService;

    public UserController(AuthenticationService authenticationService, UserService userService) {
        this.authenticationService = authenticationService;
        this.userService = userService;
    }

    @GetMapping("/game-state")
    public ResponseEntity<?> getGameState(HttpServletRequest request) {
        HttpSession session = request.getSession(false);
        if (session == null) return ResponseEntity.status(401).body("unauthenticated");
        Object tokenOrUser = session.getAttribute(USER_TOKEN);
        if (!(tokenOrUser instanceof String)) return ResponseEntity.status(401).body("unauthenticated");
        String value = (String) tokenOrUser;
        // Try to validate as token (in-memory mode)
        Optional<String> maybe = authenticationService.validateToken(value);
        String username = maybe.orElse(value); // in DB-mode the value is the username

        var dto = userService.getGameStateForUsername(username);
        if (dto == null) return ResponseEntity.status(404).body("user not found");
        return ResponseEntity.ok(dto);
    }
}
