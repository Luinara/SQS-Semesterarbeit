package io.github.luinara.sqs;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.context.annotation.Bean;

import java.time.Clock;

@SpringBootApplication(scanBasePackages = "io.github.luinara.sqs")
public class SelfCareApp {
    public static void main(String[] args) {
        SpringApplication.run(SelfCareApp.class, args);
    }

    @Bean
    public Clock clock() {
        return Clock.systemUTC();
    }
}
