package com.careerforge.controller;

import com.careerforge.util.JwtTokenUtil;
import org.springframework.http.ResponseEntity;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.security.core.userdetails.User;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.web.bind.annotation.*;

import java.util.ArrayList;
import java.util.HashMap;
import java.util.Map;

@RestController
@RequestMapping("/api/auth")
@CrossOrigin(origins = "*")
public class AuthController {

    private final PasswordEncoder passwordEncoder;
    private final JwtTokenUtil jwtTokenUtil;
    
    // Simulate database queries in JPA
    private final Map<String, DbUserRecord> userDatabase = new HashMap<>();

    public AuthController(PasswordEncoder passwordEncoder, JwtTokenUtil jwtTokenUtil) {
        this.passwordEncoder = passwordEncoder;
        this.jwtTokenUtil = jwtTokenUtil;
        
        // Seed initial admin, recruiter and seeker
        userDatabase.put("seeker@jobportal.com", new DbUserRecord("Rahul Sharma", "seeker@jobportal.com", passwordEncoder.encode("password123"), "SEEKER"));
        userDatabase.put("hr@google.com", new DbUserRecord("John Doe", "hr@google.com", passwordEncoder.encode("password123"), "RECRUITER"));
        userDatabase.put("admin@jobportal.com", new DbUserRecord("Chief Administrator", "admin@jobportal.com", passwordEncoder.encode("password123"), "ADMIN"));
    }

    @PostMapping("/register")
    public ResponseEntity<?> registerUser(@RequestBody RegistrationRequest request) {
        if (userDatabase.containsKey(request.getEmail().toLowerCase())) {
            return ResponseEntity.badRequest().body(Map.of("message", "Email address already registered."));
        }

        String hashedPassword = passwordEncoder.encode(request.getPassword());
        DbUserRecord newRecord = new DbUserRecord(
                request.getFullName(),
                request.getEmail().toLowerCase(),
                hashedPassword,
                request.getRole().toUpperCase()
        );

        userDatabase.put(request.getEmail().toLowerCase(), newRecord);
        return ResponseEntity.ok(Map.of("message", "User account registered successfully under " + request.getRole()));
    }

    @PostMapping("/login")
    public ResponseEntity<?> loginUser(@RequestBody LoginRequest request) {
        DbUserRecord record = userDatabase.get(request.getEmail().toLowerCase());
        if (record == null || !passwordEncoder.matches(request.getPassword(), record.getPassword())) {
            return ResponseEntity.status(401).body(Map.of("message", "Invalid email credentials."));
        }

        UserDetails details = new User(record.getEmail(), "", new ArrayList<>());
        String token = jwtTokenUtil.generateToken(details, record.getRole());

        Map<String, Object> response = new HashMap<>();
        response.put("token", token);
        response.put("fullName", record.getFullName());
        response.put("email", record.getEmail());
        response.put("role", record.getRole().toLowerCase());
        response.put("createdAt", record.getCreatedAt());

        return ResponseEntity.ok(response);
    }

    // Helper Beans
    public static class DbUserRecord {
        private String fullName;
        private String email;
        private String password;
        private String role;
        private String createdAt = java.time.Instant.now().toString();

        public DbUserRecord(String fullName, String email, String password, String role) {
            this.fullName = fullName;
            this.email = email;
            this.password = password;
            this.role = role;
        }

        public String getFullName() { return fullName; }
        public String getEmail() { return email; }
        public String getPassword() { return password; }
        public String getRole() { return role; }
        public String getCreatedAt() { return createdAt; }
    }

    public static class RegistrationRequest {
        private String email;
        private String password;
        private String fullName;
        private String role;

        public String getEmail() { return email; }
        public void setEmail(String email) { this.email = email; }
        public String getPassword() { return password; }
        public void setPassword(String password) { this.password = password; }
        public String getFullName() { return fullName; }
        public void setFullName(String fullName) { this.fullName = fullName; }
        public String getRole() { return role; }
        public void setRole(String role) { this.role = role; }
    }

    public static class LoginRequest {
        private String email;
        private String password;

        public String getEmail() { return email; }
        public void setEmail(String email) { this.email = email; }
        public String getPassword() { return password; }
        public void setPassword(String password) { this.password = password; }
    }
}
