package io.github.luinara.sqs.user;

import io.github.luinara.sqs.authentication.AuthenticationService;
import io.github.luinara.sqs.user.dto.GameStateDto;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.RequestBody;

import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpSession;
import java.util.Map;
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

    @PostMapping("/water")
    public ResponseEntity<?> water(HttpServletRequest request, @RequestBody WaterRequest body) {
        HttpSession session = request.getSession(false);
        if (session == null) return ResponseEntity.status(401).body(Map.of("error", "unauthenticated"));

        Object tokenOrUser = session.getAttribute(USER_TOKEN);
        if (!(tokenOrUser instanceof String))
            return ResponseEntity.status(401).body(Map.of("error", "unauthenticated"));

        String value = (String) tokenOrUser;
        Optional<String> maybe = authenticationService.validateToken(value);
        String username = maybe.orElse(value);

        GameStateDto dto = userService.waterUser(username, body.getMl());
        if (dto == null) return ResponseEntity.status(404).body(Map.of("error", "user not found"));
        return ResponseEntity.ok(dto);
    }

    @PostMapping("/feed")
    public ResponseEntity<?> feed(HttpServletRequest request) {
        HttpSession session = request.getSession(false);
        if (session == null) return ResponseEntity.status(401).body(Map.of("error", "unauthenticated"));
        Object tokenOrUser = session.getAttribute(USER_TOKEN);

        if (!(tokenOrUser instanceof String))
            return ResponseEntity.status(401).body(Map.of("error", "unauthenticated"));

        String value = (String) tokenOrUser;
        Optional<String> maybe = authenticationService.validateToken(value);
        String username = maybe.orElse(value);

        GameStateDto dto = userService.feedUser(username);
        if (dto == null) return ResponseEntity.status(404).body(Map.of("error", "user not found"));
        return ResponseEntity.ok(dto);
    }

    @PostMapping("/test-level-up")
    public ResponseEntity<?> testLevelUp(HttpServletRequest request) {
        HttpSession session = request.getSession(false);
        if (session == null) return ResponseEntity.status(401).body(Map.of("error", "unauthenticated"));
        Object tokenOrUser = session.getAttribute(USER_TOKEN);

        if (!(tokenOrUser instanceof String))
            return ResponseEntity.status(401).body(Map.of("error", "unauthenticated"));

        String value = (String) tokenOrUser;
        Optional<String> maybe = authenticationService.validateToken(value);
        String username = maybe.orElse(value);

        GameStateDto dto = userService.testLevelUp(username);
        if (dto == null) return ResponseEntity.status(404).body(Map.of("error", "user not found"));
        return ResponseEntity.ok(dto);
    }

    @DeleteMapping("/account")
    public ResponseEntity<?> deleteAccount(HttpServletRequest request) {
        HttpSession session = request.getSession(false);
        if (session == null) return ResponseEntity.status(401).body(Map.of("error", "unauthenticated"));

        Object tokenOrUser = session.getAttribute(USER_TOKEN);
        if (!(tokenOrUser instanceof String))
            return ResponseEntity.status(401).body(Map.of("error", "unauthenticated"));

        String value = (String) tokenOrUser;
        Optional<String> maybe = authenticationService.validateToken(value);
        String username = maybe.orElse(value);

        boolean deleted = userService.deleteAccount(username);
        authenticationService.logout(value);
        session.invalidate();

        if (!deleted) return ResponseEntity.status(404).body(Map.of("error", "user not found"));
        return ResponseEntity.noContent().build();
    }

    public static class WaterRequest {
        private int ml;
        public WaterRequest() {}
        public int getMl() { return ml; }
        public void setMl(int ml) { this.ml = ml; }
    }
}
