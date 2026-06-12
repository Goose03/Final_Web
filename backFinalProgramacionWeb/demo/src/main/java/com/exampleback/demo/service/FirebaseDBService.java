package com.exampleback.demo.service;

import java.time.LocalDate;
import java.util.ArrayList;
import java.util.List;

import org.springframework.stereotype.Service;

import com.exampleback.demo.model.DeveloperMetric;
import com.google.cloud.firestore.Firestore;
import com.google.cloud.firestore.QueryDocumentSnapshot;
import com.google.firebase.cloud.FirestoreClient;

@Service
public class FirebaseDBService {

    public String guardarDato() {

        try {

            Firestore db = FirestoreClient.getFirestore();

            DeveloperMetric metric = new DeveloperMetric(
                    "Francisco",
                    "2026-05-01",
                    12,
                    2,
                    5,
                    8);

            db.collection("developerMetrics")
                    .document()
                    .set(metric);

            return "Datos guardados correctamente";

        } catch (Exception e) {
            e.printStackTrace();
            return "Error al guardar datos";
        }
    }

    public List<DeveloperMetric> getMetrics() {

        try {

            Firestore db = FirestoreClient.getFirestore();

            List<QueryDocumentSnapshot> documents =
                    db.collection("developerMetrics")
                            .get()
                            .get()
                            .getDocuments();

            List<DeveloperMetric> metrics = new ArrayList<>();

            for (QueryDocumentSnapshot doc : documents) {
                metrics.add(doc.toObject(DeveloperMetric.class));
            }

            return metrics;

        } catch (Exception e) {
            throw new RuntimeException("Error reading Firestore", e);
        }
    }
}