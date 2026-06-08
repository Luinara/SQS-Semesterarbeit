package io.github.luinara.sqs.authentication;

import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/auth")
public class AuthenticationController {
    @PostMapping("/signup")
    public void signup() {
        // TODO: implement
    }

    @PostMapping("/login")
    public void login() {
        // TODO: implement
    }
}
