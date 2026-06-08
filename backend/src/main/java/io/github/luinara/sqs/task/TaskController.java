package io.github.luinara.sqs.task;

import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/tasks")
public class TaskController {
    @GetMapping
    public void getTasks() {
        // TODO: implement
    }

    @PostMapping
    public void createTask() {
        // TODO: implement
    }
}
