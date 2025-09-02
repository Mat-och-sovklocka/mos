package com.attendo.mos.errors;

import java.util.Map;

import org.springframework.http.HttpStatus;
import org.springframework.web.bind.MethodArgumentNotValidException;
import org.springframework.web.bind.annotation.ExceptionHandler;
import org.springframework.web.bind.annotation.ResponseStatus;
import org.springframework.web.bind.annotation.RestControllerAdvice;

import jakarta.servlet.http.HttpServletRequest;

/**
 * Global exception handler for API errors.
 * Handles specific exceptions and returns a standardized error response.
 */
@RestControllerAdvice
class ApiErrors {

    /**
     * Handles MethodArgumentNotValidException and IllegalArgumentException.
     * Returns a response with HTTP 400 Bad Request status and error details.
     *
     * @param e   the exception that was thrown
     * @param req the HttpServletRequest in which the exception occurred
     * @return a map containing error details: status, error, message, and path
     */
    @ExceptionHandler({ MethodArgumentNotValidException.class, IllegalArgumentException.class })
    @ResponseStatus(HttpStatus.BAD_REQUEST)
    Map<String, Object> badReq(Exception e, HttpServletRequest req) {
        return Map.of(
                "status", 400,
                "error", "Bad Request",
                "message", e.getMessage(),
                "path", req.getRequestURI());
    }
}
