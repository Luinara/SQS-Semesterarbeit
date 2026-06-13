package io.github.luinara.sqs.task;

import io.github.luinara.sqs.task.entity.TaskEntity;
import io.github.luinara.sqs.task.entity.UserTaskEntity;
import io.github.luinara.sqs.user.UserEntity;
import io.github.luinara.sqs.user.UserRepository;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.ArgumentCaptor;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import java.util.List;
import java.util.Optional;

import static org.assertj.core.api.Assertions.assertThat;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
class TaskServiceTest {

    @Mock
    private TaskRepository taskRepository;

    @Mock
    private UserTaskRepository userTaskRepository;

    @Mock
    private UserRepository userRepository;

    @InjectMocks
    private TaskService taskService;

    private UserEntity user;

    @BeforeEach
    void setUp() {
        user = new UserEntity();
        user.setId(1L);
        user.setUsername("tester");
        user.setHappiness(0);
        user.setPokemonLevel(1);
        user.setPokemonXp(0);
        user.setHydrationMl(50);
        user.setHunger(50);
    }

    @Test
    void completeTask_success_appliesEffects() {
        when(userRepository.findByUsernameIgnoreCase("tester")).thenReturn(Optional.of(user));

        TaskEntity task = new TaskEntity();
        task.setId(2L);
        task.setTitle("Do something");
        when(taskRepository.findById(2L)).thenReturn(Optional.of(task));

        when(userTaskRepository.findByUserIdAndTaskId(1L, 2L)).thenReturn(Optional.empty());
        when(taskRepository.count()).thenReturn(5L);

        GameStateResult res = taskService.completeTaskForUser("tester", 2L);

        assertThat(res.status).isEqualTo(200);
        assertThat(res.gameState).isNotNull();
        // happiness increment should be round(100/5) = 20
        assertThat(res.gameState.getHappiness()).isEqualTo(20);
        // xp increased by 10
        assertThat(res.gameState.getGrowth()).isEqualTo(10);

        // verify user saved
        ArgumentCaptor<UserEntity> captor = ArgumentCaptor.forClass(UserEntity.class);
        verify(userRepository).save(captor.capture());
        UserEntity saved = captor.getValue();
        assertThat(saved.getHappiness()).isEqualTo(20);
        assertThat(saved.getPokemonXp()).isEqualTo(10);
    }

    @Test
    void completeTask_alreadyCompleted_returns409() {
        when(userRepository.findByUsernameIgnoreCase("tester")).thenReturn(Optional.of(user));

        TaskEntity task = new TaskEntity();
        task.setId(3L);
        when(taskRepository.findById(3L)).thenReturn(Optional.of(task));

        UserTaskEntity ute = new UserTaskEntity();
        ute.setUserId(1L);
        ute.setTaskId(3L);
        ute.setCompleted(true);
        when(userTaskRepository.findByUserIdAndTaskId(1L, 3L)).thenReturn(Optional.of(ute));

        GameStateResult res = taskService.completeTaskForUser("tester", 3L);
        assertThat(res.status).isEqualTo(409);
    }

    @Test
    void completeTask_taskNotFound_returns404() {
        when(userRepository.findByUsernameIgnoreCase("tester")).thenReturn(Optional.of(user));
        when(taskRepository.findById(99L)).thenReturn(Optional.empty());

        GameStateResult res = taskService.completeTaskForUser("tester", 99L);
        assertThat(res.status).isEqualTo(404);
    }

    @Test
    void completeTask_userNotFound_returns404() {
        when(userRepository.findByUsernameIgnoreCase("unknown")).thenReturn(Optional.empty());

        GameStateResult res = taskService.completeTaskForUser("unknown", 1L);
        assertThat(res.status).isEqualTo(404);
    }
}
