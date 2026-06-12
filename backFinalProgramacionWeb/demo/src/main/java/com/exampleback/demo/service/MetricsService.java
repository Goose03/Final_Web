package com.exampleback.demo.service;

import java.util.List;

import org.springframework.stereotype.Service;

import com.exampleback.demo.model.DeveloperMetric;

@Service
public class MetricsService {

    private final FirebaseDBService firebaseDBService;

    public MetricsService(FirebaseDBService firebaseDBService) {
        this.firebaseDBService = firebaseDBService;
    }

    public List<DeveloperMetric> getAllMetrics() {
        return firebaseDBService.getMetrics();
    }
}