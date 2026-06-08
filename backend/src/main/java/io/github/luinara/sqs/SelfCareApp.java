package io.github.luinara.sqs;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;

@SpringBootApplication(scanBasePackages = "io.github.luinara.sqs")
public class SelfCareApp {
    public static void main(String[] args) {
        SpringApplication.run(SelfCareApp.class, args);
    }
}
