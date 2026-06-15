package io.github.luinara.sqs.task;

import io.github.luinara.sqs.task.entity.TaskEntity;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import java.util.List;
import java.util.Optional;

import static org.assertj.core.api.Assertions.assertThat;
import static org.mockito.Mockito.when;

@ExtendWith(MockitoExtension.class)
class TaskServiceFindTest {

    @Mock
    private TaskRepository taskRepository;

    @Mock
    private UserTaskRepository userTaskRepository;

    @Mock
    private io.github.luinara.sqs.user.UserRepository userRepository;

    @Mock
    private io.github.luinara.sqs.pokemon.PokemonRepository pokemonRepository;

    @InjectMocks
    private TaskService taskService;

    @Test
    void findAllTasks_returnsMappedList() {
        TaskEntity t = new TaskEntity();
        t.setId(1L);
        t.setTitle("T1");
        t.setDescription("D1");
        when(taskRepository.findAll()).thenReturn(List.of(t));

        var res = taskService.findAllTasks();
        assertThat(res).hasSize(1);
        assertThat(res.get(0).getId()).isEqualTo(1L);
        assertThat(res.get(0).getTitle()).isEqualTo("T1");
    }

    @Test
    void findById_existing_returnsDto() {
        TaskEntity t = new TaskEntity();
        t.setId(2L);
        t.setTitle("T2");
        t.setDescription("D2");
        when(taskRepository.findById(2L)).thenReturn(Optional.of(t));

        var dto = taskService.findById(2L);
        assertThat(dto).isNotNull();
        assertThat(dto.getId()).isEqualTo(2L);
    }

    @Test
    void findById_missing_returnsNull() {
        when(taskRepository.findById(99L)).thenReturn(Optional.empty());
        var dto = taskService.findById(99L);
        assertThat(dto).isNull();
    }
}
