package com.exampleback.demo.controller;

import java.util.List;

import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RestController;

import com.exampleback.demo.model.DeveloperMetric;
import com.exampleback.demo.service.MetricsService;

@RestController
public class MetricsController {

    private final MetricsService metricsService;

    public MetricsController(MetricsService metricsService) {
        this.metricsService = metricsService;
    }

    @GetMapping("/metrics")
    public List<DeveloperMetric> getMetrics() {
        return metricsService.getAllMetrics();
    }
}