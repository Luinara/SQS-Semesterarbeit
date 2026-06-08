package io.github.luinara.sqs;

import org.junit.jupiter.api.Test;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.test.context.ActiveProfiles;

// Import the main application class so tests can locate the SpringBootConfiguration
import io.github.luinara.sqs.SelfCareApp;

@SpringBootTest(classes = SelfCareApp.class)
@ActiveProfiles("test")
class SelfCareApplicationTests {

    @Test
    void contextLoads() {
        // Verifies that the Spring application context starts without errors.
    }
}
