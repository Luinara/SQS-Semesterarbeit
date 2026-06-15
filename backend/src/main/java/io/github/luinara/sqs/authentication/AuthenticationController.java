package io.github.luinara.sqs.authentication;

import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.validation.annotation.Validated;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpSession;
import jakarta.validation.Valid;
import java.util.Map;
import java.util.Optional;

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
    public ResponseEntity<?> signup(@Valid @RequestBody SignupRequest req, HttpServletRequest request) {
        HttpSession session = request.getSession();
        boolean created;

        try {
            created = authenticationService.createUser(
                    req.getUsername(),
                    req.getPassword(),
                    req.getStarterPokemonId()
            );
        } catch (InvalidRequestException ex) {
            return ResponseEntity.badRequest().body(Map.of("error", ex.getMessage()));
        }
        if (!created) {
            return ResponseEntity.status(HttpStatus.CONFLICT).body(Map.of("error", "username already exists"));
        }

        // Auto-login on signup
        Optional<String> maybe = authenticationService.login(req.getUsername(), req.getPassword());
        if (maybe.isPresent()) {
            String value = maybe.get();
            try {
                request.changeSessionId();
            } catch (UnsupportedOperationException ignore) {
                session.invalidate();
                session = request.getSession(true);
            }
            session.setAttribute(USER_TOKEN, value);
        }
        return ResponseEntity.status(HttpStatus.CREATED).body(Map.of("message", "user created"));
    }

    @PostMapping("/login")
    public ResponseEntity<?> login(@Valid @RequestBody LoginRequest req, HttpServletRequest request) {

        HttpSession session = request.getSession();
        Optional<String> maybe = authenticationService.login(req.getUsername(), req.getPassword());
        if (maybe.isPresent()) {
            String value = maybe.get();
            try {
                request.changeSessionId();
            } catch (UnsupportedOperationException ignore) {
                session.invalidate();
                session = request.getSession(true);
            }
            session.setAttribute(USER_TOKEN, value);
            return ResponseEntity.ok(Map.of("message", "authenticated"));
        }
        return ResponseEntity.status(HttpStatus.UNAUTHORIZED)
                .body(Map.of("error", "invalid username or password"));
    }

    @PostMapping("/logout")
    public ResponseEntity<?> logout(HttpServletRequest request) {

        HttpSession session = request.getSession(false);
        if (session != null) {
            Object tokenOrUser = session.getAttribute(USER_TOKEN);
            if (tokenOrUser instanceof String) {
                authenticationService.logout((String) tokenOrUser);
            }
            session.invalidate();
        }
        return ResponseEntity.noContent().build();
    }
}
