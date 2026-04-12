package com.shopnest.userservice.controller;

import com.shopnest.userservice.dto.AuthResponse;
import com.shopnest.userservice.dto.LoginRequest;
import com.shopnest.userservice.dto.RegisterRequest;
import com.shopnest.userservice.dto.UpdateProfileRequest;
import com.shopnest.userservice.model.User;
import com.shopnest.userservice.security.JwtUtil;
import com.shopnest.userservice.service.UserService;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/users")
@RequiredArgsConstructor
public class UserController {

    private final UserService userService;
    private final JwtUtil jwtUtil;

    @PostMapping("/register")
    public ResponseEntity<AuthResponse> register(@Valid @RequestBody RegisterRequest request) {
        return ResponseEntity.ok(userService.register(request));
    }

    @PostMapping("/login")
    public ResponseEntity<AuthResponse> login(@Valid @RequestBody LoginRequest request) {
        return ResponseEntity.ok(userService.login(request));
    }

    @GetMapping("/me")
    public ResponseEntity<User> getMe(HttpServletRequest request) {
        return ResponseEntity.ok(userService.getProfile(extractUserId(request)));
    }

    @PutMapping("/me")
    public ResponseEntity<User> updateMe(@Valid @RequestBody UpdateProfileRequest request, HttpServletRequest httpRequest) {
        return ResponseEntity.ok(userService.updateProfile(extractUserId(httpRequest), request));
    }

    @GetMapping("/{id}")
    public ResponseEntity<User> getUserById(@PathVariable String id) {
        return ResponseEntity.ok(userService.getUserById(id));
    }

    private String extractUserId(HttpServletRequest request) {
        String authHeader = request.getHeader("Authorization");
        if (authHeader == null || !authHeader.startsWith("Bearer ")) {
            throw new IllegalArgumentException("Authorization token is missing");
        }
        return jwtUtil.extractUserId(authHeader.substring(7));
    }
}
