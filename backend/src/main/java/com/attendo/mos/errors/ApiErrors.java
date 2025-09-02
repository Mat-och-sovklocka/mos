package com.attendo.mos.errors;

import java.util.Map;

import org.springframework.http.HttpStatus;
import org.springframework.web.bind.MethodArgumentNotValidException;
import org.springframework.web.bind.annotation.ExceptionHandler;
import org.springframework.web.bind.annotation.ResponseStatus;
import org.springframework.web.bind.annotation.RestControllerAdvice;

import jakarta.servlet.http.HttpServletRequest;

@RestControllerAdvice
class ApiErrors {
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
