package io.github.luinara.sqs.task;

import io.github.luinara.sqs.task.entity.UserTaskEntity;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface UserTaskRepository extends JpaRepository<UserTaskEntity, Long> {
    Optional<UserTaskEntity> findByUserIdAndTaskId(Long userId, Long taskId);
    List<UserTaskEntity> findByUserId(Long userId);
}
