package com.shopnest.recommendationservice.controller;

import com.shopnest.recommendationservice.dto.BehaviorRequest;
import com.shopnest.recommendationservice.dto.BundleSuggestion;
import com.shopnest.recommendationservice.dto.CooccurrenceRequest;
import com.shopnest.recommendationservice.dto.RecommendationResponse;
import com.shopnest.recommendationservice.service.RecommendationService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/recommendations")
@RequiredArgsConstructor
public class RecommendationController {

    private final RecommendationService recommendationService;

    @PostMapping("/behavior")
    public ResponseEntity<Void> recordBehavior(@RequestBody BehaviorRequest request) {
        recommendationService.recordBehavior(request);
        return ResponseEntity.ok().build();
    }

    @GetMapping("/{userId}")
    public ResponseEntity<RecommendationResponse> getRecommendations(@PathVariable String userId) {
        return ResponseEntity.ok(recommendationService.getRecommendations(userId));
    }

    @GetMapping("/similar/{productId}")
    public ResponseEntity<RecommendationResponse> getSimilar(@PathVariable String productId) {
        return ResponseEntity.ok(recommendationService.getSimilarProducts(productId));
    }

    @PostMapping("/cooccurrence/update")
    public ResponseEntity<Void> updateCooccurrence(@RequestBody CooccurrenceRequest request) {
        recommendationService.updateCooccurrence(request);
        return ResponseEntity.ok().build();
    }

    @GetMapping("/bundles/suggest")
    public ResponseEntity<List<BundleSuggestion>> getBundleSuggestions() {
        return ResponseEntity.ok(recommendationService.suggestBundles());
    }
}
