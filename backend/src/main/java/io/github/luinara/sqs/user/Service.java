package io.github.luinara.sqs.service;

import io.github.luinara.sqs.domain.User;

public interface UserService {
    User createUser(User user);
    User findByUsername(String username);
    // TODO: implement
}
