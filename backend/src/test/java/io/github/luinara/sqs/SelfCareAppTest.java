package io.github.luinara.sqs;

import io.github.luinara.sqs.authentication.AuthenticationController;
import io.github.luinara.sqs.authentication.AuthenticationService;
import io.github.luinara.sqs.task.TaskController;
import io.github.luinara.sqs.task.TaskRepository;
import io.github.luinara.sqs.task.TaskService;
import io.github.luinara.sqs.user.UserController;
import io.github.luinara.sqs.user.UserRepository;
import io.github.luinara.sqs.user.UserService;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.context.ApplicationContext;
import org.springframework.core.env.Environment;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.test.context.ActiveProfiles;

import java.sql.Connection;
import java.sql.SQLException;
import java.time.Clock;
import java.time.ZoneOffset;

import javax.sql.DataSource;

import static org.assertj.core.api.Assertions.assertThat;

@SpringBootTest(classes = SelfCareApp.class)
@ActiveProfiles("test")
class SelfCareApplicationTests {

    @Autowired
    private ApplicationContext context;

    @Autowired
    private Environment environment;

    @Autowired
    private DataSource dataSource;

    @Autowired
    private Clock clock;

    @Test
    void contextLoadsCoreApplicationBeans() {
        assertThat(context).isNotNull();
        assertThat(context.getBean(AuthenticationController.class)).isNotNull();
        assertThat(context.getBean(UserController.class)).isNotNull();
        assertThat(context.getBean(TaskController.class)).isNotNull();
        assertThat(context.getBean(AuthenticationService.class)).isNotNull();
        assertThat(context.getBean(UserService.class)).isNotNull();
        assertThat(context.getBean(TaskService.class)).isNotNull();
        assertThat(context.getBean(UserRepository.class)).isNotNull();
        assertThat(context.getBean(TaskRepository.class)).isNotNull();
    }

    @Test
    void testProfileUsesInMemoryH2Database() throws SQLException {
        assertThat(environment.getActiveProfiles()).contains("test");

        try (Connection connection = dataSource.getConnection()) {
            assertThat(connection.getMetaData().getURL()).startsWith("jdbc:h2:mem:testdb");
        }
    }

    @Test
    void clockBeanUsesUtcTimeZone() {
        assertThat(clock.getZone()).isEqualTo(ZoneOffset.UTC);
        assertThat(clock.instant()).isNotNull();
    }
}
