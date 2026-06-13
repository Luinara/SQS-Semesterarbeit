package io.github.luinara.sqs.task;

import io.github.luinara.sqs.task.entity.TaskEntity;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.stream.Collectors;

@Service
public class TaskService {

    private final TaskRepository taskRepository;

    public TaskService(TaskRepository taskRepository) {
        this.taskRepository = taskRepository;
    }

    public List<TaskPublicDto> findAllTasks() {
        List<TaskEntity> entities = taskRepository.findAll();
        return entities.stream().map(e -> new TaskPublicDto(e.getId(), e.getTitle(), e.getDescription()))
                .collect(Collectors.toList());
    }

    public TaskPublicDto findById(Long id) {
        TaskEntity e = taskRepository.findById(id).orElse(null);
        return e == null ? null : new TaskPublicDto(e.getId(), e.getTitle(), e.getDescription());
    }
}
