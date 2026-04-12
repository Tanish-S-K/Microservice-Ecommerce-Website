package com.shopnest.userservice.config;

import com.shopnest.userservice.model.User;
import com.shopnest.userservice.repository.UserRepository;
import jakarta.annotation.PostConstruct;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Component;

import java.time.LocalDateTime;

@Component
@RequiredArgsConstructor
@Slf4j
public class UserServiceDataSeeder {

    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;

    @PostConstruct
    public void seedDemoUser() {
        if (userRepository.findByEmail("demo@shopnest.com").isPresent()) {
            return;
        }

        User demoUser = new User();
        demoUser.setId("demo-user-123");
        demoUser.setName("Demo User");
        demoUser.setEmail("demo@shopnest.com");
        demoUser.setPasswordHash(passwordEncoder.encode("password123"));
        demoUser.setRole("USER");
        demoUser.setCreatedAt(LocalDateTime.now());

        userRepository.save(demoUser);
        log.info("Demo user 'demo@shopnest.com' created successfully with ID 'demo-user-123'");
    }
}
