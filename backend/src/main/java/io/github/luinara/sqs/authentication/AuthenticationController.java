package io.github.luinara.sqs.authentication;

import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.validation.annotation.Validated;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import jakarta.servlet.http.HttpSession;
import jakarta.validation.Valid;
import java.util.Map;

@RestController
@RequestMapping("/api/auth")
@Validated
public class AuthenticationController {

    private static final String USER_TOKEN = "USER_TOKEN";

    private final AuthenticationService authenticationService;

    public AuthenticationController(AuthenticationService authenticationService) {
        this.authenticationService = authenticationService;
    }

    @PostMapping("/signup")
    public ResponseEntity<?> signup(@Valid @RequestBody SignupRequest req, HttpSession session) {
        boolean created;
        try {
            created = authenticationService.createUser(req.getUsername(), req.getPassword());
        } catch (InvalidRequestException ex) {
            return ResponseEntity.badRequest().body(Map.of("error", ex.getMessage()));
        }
        if (!created) {
            return ResponseEntity.status(HttpStatus.CONFLICT).body(Map.of("error", "username already exists"));
        }
        // Auto-login on signup
        authenticationService.login(
                req.getUsername(),
                req.getPassword()).ifPresent(token -> session.setAttribute(USER_TOKEN, token));
        return ResponseEntity.status(HttpStatus.CREATED).body(Map.of("message", "user created"));
    }

    @PostMapping("/login")
    public ResponseEntity<?> login(@Valid @RequestBody LoginRequest req, HttpSession session) {
        return authenticationService.login(req.getUsername(), req.getPassword())
                .map(token -> {
                    session.setAttribute(USER_TOKEN, token);
                    return ResponseEntity.ok(Map.of("token", token));
                })
                .orElseGet(() -> ResponseEntity.status(HttpStatus.UNAUTHORIZED)
                        .body(Map.of("error", "invalid username or password")));
    }

    @PostMapping("/logout")
    public ResponseEntity<?> logout(HttpSession session) {
        Object token = session.getAttribute(USER_TOKEN);
        if (token instanceof String) {
            authenticationService.logout((String) token);
        }
        session.removeAttribute(USER_TOKEN);
        return ResponseEntity.noContent().build();
    }
}
