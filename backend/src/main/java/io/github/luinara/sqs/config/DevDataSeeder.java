package io.github.luinara.sqs.config;

import io.github.luinara.sqs.authentication.AuthenticationService;
import io.github.luinara.sqs.task.TaskRepository;
import io.github.luinara.sqs.task.entity.TaskEntity;
import io.github.luinara.sqs.user.UserRepository;
import org.springframework.boot.ApplicationArguments;
import org.springframework.boot.ApplicationRunner;
import org.springframework.context.annotation.Profile;
import org.springframework.stereotype.Component;

import java.util.List;

@Component
@Profile("dev")
public class DevDataSeeder implements ApplicationRunner {

    private static final String DEMO_USERNAME = "demo";
    private static final String DEMO_PASSWORD = "password123";

    private final AuthenticationService authenticationService;
    private final UserRepository userRepository;
    private final TaskRepository taskRepository;

    public DevDataSeeder(
            AuthenticationService authenticationService,
            UserRepository userRepository,
            TaskRepository taskRepository
    ) {
        this.authenticationService = authenticationService;
        this.userRepository = userRepository;
        this.taskRepository = taskRepository;
    }

    @Override
    public void run(ApplicationArguments args) {
        seedDemoUser();
        seedTasks();
    }

    private void seedDemoUser() {
        if (userRepository.existsByUsernameIgnoreCase(DEMO_USERNAME)) {
            return;
        }

        authenticationService.createUser(DEMO_USERNAME, DEMO_PASSWORD);
    }

    private void seedTasks() {
        for (SeedTask task : defaultTasks()) {
            TaskEntity entity = taskRepository.findByTitle(task.title())
                    .or(() -> task.legacyTitle() == null
                            ? java.util.Optional.empty()
                            : taskRepository.findByTitle(task.legacyTitle()))
                    .orElseGet(() -> {
                TaskEntity newTask = new TaskEntity();
                return newTask;
            });

            entity.setTitle(task.title());
            entity.setDescription(task.description());
            entity.setFeedPoints(task.feedPoints());
            taskRepository.save(entity);
        }
    }

    private List<SeedTask> defaultTasks() {
        return List.of(
                new SeedTask("Wasser trinken", null, "Trinke Wasser und speichere deinen Fortschritt im Backend.", 10),
                new SeedTask("30 Minuten lernen", null, "Schließe eine fokussierte Lerneinheit ab.", 20),
                new SeedTask("Sport erledigen", null, "Bewegung bringt Feed-Punkte für dein Pokémon.", 20),
                new SeedTask(
                        "Workspace aufräumen",
                        "Workspace aufraeumen",
                        "Räume deinen Arbeitsbereich für besseren Fokus auf.",
                        15
                ),
                new SeedTask("10 Seiten lesen", null, "Lies zehn Seiten und sammle Routinepunkte.", 10)
        );
    }

    private record SeedTask(String title, String legacyTitle, String description, int feedPoints) {
    }
}
