package io.github.luinara.sqs.domain;

public class Task {
    private Long id;
    private String title;
    private Long userId;
    private boolean completed = false;

    // Default constructor
    public Task() {
    }

    // Full constructor for first version
    public Task(Long id, String title, Long userId, boolean completed) {
        this.id = id;
        this.title = title;
        this.userId = userId;
        this.completed = completed;
    }

    public Long getId() {
        return id;
    }

    public void setId(Long id) {
        this.id = id;
    }

    public String getTitle() {
        return title;
    }

    public void setTitle(String title) {
        this.title = title;
    }

    public Long getUserId() {
        return userId;
    }

    public void setUserId(Long userId) {
        this.userId = userId;
    }

    public boolean isCompleted() {
        return completed;
    }

    public void setCompleted(boolean completed) {
        this.completed = completed;
    }

    @Override
    public String toString() {
        return "Task{" +
                "id=" + id +
                ", title='" + title + '\'' +
                ", userId=" + userId +
                ", completed=" + completed +
                '}';
    }

    // TODO: implement additional business logic if needed
}
