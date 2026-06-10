package io.github.luinara.sqs.authentication;

/**
 * Domain-specific unchecked exception used when a request is invalid.
 * Unchecked to satisfy architecture rules and to simplify callers
 * (no checked exception propagation required).
 */

public class InvalidRequestException extends RuntimeException {
    public InvalidRequestException(String message) {
        super(message);
    }

    public InvalidRequestException(String message, Throwable cause) {
        super(message, cause);
    }
}
