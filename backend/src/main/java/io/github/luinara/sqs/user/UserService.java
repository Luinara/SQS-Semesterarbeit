package io.github.luinara.sqs.user;

import io.github.luinara.sqs.user.User;

public interface UserService {
    User createUser(User user);
    User findByUsername(String username);
    // TODO: implement
}
