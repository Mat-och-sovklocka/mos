package com.attendo.mos.config;

import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.context.annotation.Profile;
import org.springframework.security.config.annotation.web.builders.HttpSecurity;
import org.springframework.security.web.SecurityFilterChain;

// config/SecurityDevConfig.java

//todo: remove this and add proper security for production!
// DISABLED - Using JwtSecurityConfig instead
//@Configuration
//@Profile("dev")
public class SecurityDevConfig {
    @Bean
    SecurityFilterChain security(HttpSecurity http) throws Exception {
        return http
                .csrf(csrf -> csrf.disable())
                .authorizeHttpRequests(auth -> auth.anyRequest().permitAll())
                .httpBasic(b -> b.disable())
                .formLogin(f -> f.disable())
                .build();
    }
}
