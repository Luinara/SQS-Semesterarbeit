package io.github.luinara.sqs.authentication;

import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.AutoConfigureMockMvc;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.http.MediaType;
import org.springframework.test.context.ActiveProfiles;
import org.springframework.test.web.servlet.MockMvc;

import java.util.ArrayList;
import java.util.List;
import java.util.concurrent.Callable;
import java.util.concurrent.CountDownLatch;
import java.util.concurrent.ExecutorService;
import java.util.concurrent.Executors;
import java.util.concurrent.Future;
import java.util.concurrent.TimeUnit;

import static org.assertj.core.api.Assertions.assertThat;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

@SpringBootTest
@AutoConfigureMockMvc
@ActiveProfiles("test")
class AuthenticationControllerConcurrentSignUpIT {

    @Autowired
    private MockMvc mockMvc;

    @Test
    void concurrentSignupOneSucceedsOneConflicts() throws Exception {
        String body = "{\"username\": \"concurrentUser\", \"password\": \"password123\"}";

        int threads = 2;
        ExecutorService ex = Executors.newFixedThreadPool(threads);
        CountDownLatch latch = new CountDownLatch(1);

        // Create callables and submit them to the executor without blocking the submitting thread.
        List<Callable<Integer>> tasks = new ArrayList<>();
        for (int i = 0; i < threads; i++) {
            tasks.add(() -> {
                latch.await(); // wait until all tasks are ready to run
                var res = mockMvc.perform(post("/api/auth/signup")
                                .contentType(MediaType.APPLICATION_JSON)
                                .content(body))
                        .andReturn().getResponse().getStatus();
                return res;
            });
        }

        List<Future<Integer>> futures = new ArrayList<>();
        try {
            for (var task : tasks) {
                futures.add(ex.submit(task));
            }

            // Release all workers at once
            latch.countDown();

            int created = 0;
            int conflict = 0;
            for (var f : futures) {
                int status = f.get();
                if (status == 201) created++;
                if (status == 409) conflict++;
            }

            assertThat(created).isEqualTo(1);
            assertThat(conflict).isEqualTo(1);
        } finally {
            ex.shutdownNow();
            ex.awaitTermination(5, TimeUnit.SECONDS);
        }
    }
}
