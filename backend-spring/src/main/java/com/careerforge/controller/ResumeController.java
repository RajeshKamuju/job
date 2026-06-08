package com.careerforge.controller;

import org.springframework.http.HttpHeaders;
import org.springframework.http.HttpStatus;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.io.File;
import java.io.IOException;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;
import java.util.HashMap;
import java.util.Map;
import java.util.UUID;

@RestController
@RequestMapping("/api/seeker/resume")
@CrossOrigin(origins = "*")
public class ResumeController {

    private final String UPLOAD_DIRECTORY = System.getProperty("user.dir") + "/uploads/resumes";

    public ResumeController() {
        // Create upload directory if missing
        File directory = new File(UPLOAD_DIRECTORY);
        if (!directory.exists()) {
            directory.mkdirs();
        }
    }

    @PostMapping("/upload")
    public ResponseEntity<?> uploadResume(
            @RequestParam("file") MultipartFile file,
            @RequestParam("seekerId") String seekerId,
            @RequestHeader("Authorization") String token) {

        if (file.isEmpty()) {
            return ResponseEntity.badRequest().body(Map.of("message", "File cannot be empty. Please select a valid PDF resume document."));
        }

        if (!file.getContentType().equalsIgnoreCase("application/pdf")) {
            return ResponseEntity.status(HttpStatus.UNSUPPORTED_MEDIA_TYPE)
                    .body(Map.of("message", "Invalid file format. Only PDF files are supported for resume uploading."));
        }

        try {
            // Generate a unique filename to store in MySQL files directories
            String originalFilename = file.getOriginalFilename();
            String uniqueFilename = UUID.randomUUID().toString() + "_" + originalFilename;
            Path filePath = Paths.get(UPLOAD_DIRECTORY, uniqueFilename);

            // Copy file content bytes physically on the server
            Files.write(filePath, file.getBytes());

            // Simulate saving target file path entry to MySQL Seeker profile table via JPA entity manager
            Map<String, Object> response = new HashMap<>();
            response.put("message", "Resume uploaded successfully with MultipartFile API.");
            response.put("originalName", originalFilename);
            response.put("mysqlStoragePath", filePath.toString());
            response.put("downloadUrl", "/api/seeker/resume/download/" + uniqueFilename);
            response.put("seekerId", seekerId);

            return ResponseEntity.ok(response);

        } catch (IOException e) {
            return ResponseEntity.status(500).body(Map.of("message", "Internal Server Error occurred during attachment saving: " + e.getMessage()));
        }
    }

    @GetMapping("/download/{fileName:.+}")
    public ResponseEntity<?> downloadResume(@PathVariable String fileName) {
        try {
            Path filePath = Paths.get(UPLOAD_DIRECTORY, fileName);
            File file = filePath.toFile();

            if (!file.exists()) {
                return ResponseEntity.status(HttpStatus.NOT_FOUND)
                        .body(Map.of("message", "Target resume PDF has either been purged or does not exist on the file-system."));
            }

            byte[] fileBytes = Files.readAllBytes(filePath);

            return ResponseEntity.ok()
                    .header(HttpHeaders.CONTENT_DISPOSITION, "attachment; filename=\"" + file.getName().substring(37) + "\"")
                    .contentType(MediaType.APPLICATION_PDF)
                    .contentLength(fileBytes.length)
                    .body(fileBytes);

        } catch (IOException e) {
            return ResponseEntity.status(500).body(Map.of("message", "Error reading target resource: " + e.getMessage()));
        }
    }
}
