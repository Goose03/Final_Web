package com.exampleback.demo.controller;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RestController;
import com.exampleback.demo.service.FirebaseDBService;

@RestController
public class TestDBController {
    private final FirebaseDBService firebaseDBService;
        public TestDBController(FirebaseDBService firebaseDBService) {
            this.firebaseDBService = firebaseDBService;
        }
        @GetMapping("/Final-Web")
        public String testFirebase() {
        firebaseDBService.guardarDato();
        return "Dato enviado a Firebase";
    }
}