package io.github.luinara.sqs.authentication;

import org.junit.jupiter.api.Test;

import static org.assertj.core.api.Assertions.assertThat;

class SignupRequestTest {

    @Test
    void constructor_setsFields() {
        SignupRequest req = new SignupRequest("alice", "password123");
        assertThat(req.getUsername()).isEqualTo("alice");
        assertThat(req.getPassword()).isEqualTo("password123");
    }
}
