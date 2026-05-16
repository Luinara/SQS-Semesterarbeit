package io.github.luinara.sqs.common.test;

import java.util.UUID;

/**
 * Utility class for creating test fixtures and common test data.
 * Reduces duplication across feature tests.
 */
public class TestFixtures {

    /**
     * Creates a random UUID for testing.
     */
    public static Long generateId() {
        return UUID.randomUUID().getMostSignificantBits() & Long.MAX_VALUE;
    }

    /**
     * Creates a test email address.
     */
    public static String generateTestEmail() {
        return "test_" + UUID.randomUUID().toString().substring(0, 8) + "@example.com";
    }

    /**
     * Creates a test username.
     */
    public static String generateTestUsername() {
        return "user_" + UUID.randomUUID().toString().substring(0, 8);
    }

    /**
     * Creates a test password.
     */
    public static String generateTestPassword() {
        return "Password123!@#" + UUID.randomUUID().toString().substring(0, 8);
    }
}
