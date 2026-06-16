package io.github.luinara.sqs.task;

import io.github.luinara.sqs.task.entity.UserTaskEntity;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.Optional;

@Repository
public interface UserTaskRepository extends JpaRepository<UserTaskEntity, Long> {
    Optional<UserTaskEntity> findByUserIdAndTaskId(Long userId, Long taskId);
    List<UserTaskEntity> findByUserId(Long userId);

    @Transactional
    void deleteByUserId(Long userId);

    @Transactional
    @Modifying
    @Query("UPDATE UserTaskEntity userTask SET userTask.completed = false WHERE userTask.userId = :userId")
    void resetCompletionsByUserId(@Param("userId") Long userId);
}
