package com.shopnest.userservice.service;

import com.shopnest.userservice.dto.AuthResponse;
import com.shopnest.userservice.dto.LoginRequest;
import com.shopnest.userservice.dto.RegisterRequest;
import com.shopnest.userservice.dto.UpdateProfileRequest;
import com.shopnest.userservice.model.User;
import com.shopnest.userservice.repository.UserRepository;
import com.shopnest.userservice.security.JwtUtil;
import lombok.RequiredArgsConstructor;
import org.springframework.security.authentication.BadCredentialsException;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;

@Service
@RequiredArgsConstructor
public class UserService {

    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;
    private final JwtUtil jwtUtil;

    public AuthResponse register(RegisterRequest request) {
        userRepository.findByEmail(request.getEmail().trim().toLowerCase())
                .ifPresent(user -> {
                    throw new IllegalArgumentException("Email is already registered");
                });

        User user = new User();
        user.setName(request.getName().trim());
        user.setEmail(request.getEmail().trim().toLowerCase());
        user.setPasswordHash(passwordEncoder.encode(request.getPassword()));
        user.setRole("USER");
        user.setCreatedAt(LocalDateTime.now());

        User savedUser = userRepository.save(user);
        return toAuthResponse(savedUser);
    }

    public AuthResponse login(LoginRequest request) {
        User user = userRepository.findByEmail(request.getEmail().trim().toLowerCase())
                .orElseThrow(() -> new BadCredentialsException("Invalid email or password"));
        if (!passwordEncoder.matches(request.getPassword(), user.getPasswordHash())) {
            throw new BadCredentialsException("Invalid email or password");
        }
        return toAuthResponse(user);
    }

    public User getProfile(String userId) {
        return userRepository.findById(userId)
                .orElseThrow(() -> new IllegalArgumentException("User not found"));
    }

    public User updateProfile(String userId, UpdateProfileRequest request) {
        User user = getProfile(userId);
        user.setName(request.getName().trim());
        return userRepository.save(user);
    }

    public User getUserById(String id) {
        return userRepository.findById(id)
                .orElseThrow(() -> new IllegalArgumentException("User not found"));
    }

    private AuthResponse toAuthResponse(User user) {
        return new AuthResponse(
                jwtUtil.generateToken(user),
                user.getId(),
                user.getName(),
                user.getEmail(),
                user.getRole()
        );
    }
}
