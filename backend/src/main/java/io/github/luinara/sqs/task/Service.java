package io.github.luinara.sqs.task;

import io.github.luinara.sqs.domain.Task;

public interface Service {
    Task createTask(Task task);
    Task findById(Long id);
    // TODO: implement
}
