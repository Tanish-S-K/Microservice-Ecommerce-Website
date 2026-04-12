package com.shopnest.recommendationservice.config;

import com.shopnest.recommendationservice.model.ProductCooccurrence;
import com.shopnest.recommendationservice.model.UserBehavior;
import com.shopnest.recommendationservice.repository.ProductCooccurrenceRepository;
import com.shopnest.recommendationservice.repository.UserBehaviorRepository;
import jakarta.annotation.PostConstruct;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Component;
import org.springframework.web.client.RestTemplate;

import java.net.URLEncoder;
import java.nio.charset.StandardCharsets;
import java.time.LocalDateTime;
import java.util.List;
import java.util.Map;

@Component
@RequiredArgsConstructor
@Slf4j
public class RecommendationSeeder {

    private final UserBehaviorRepository behaviorRepository;
    private final ProductCooccurrenceRepository cooccurrenceRepository;
    private final RestTemplate restTemplate;

    @Value("${services.product.url:http://localhost:8082}")
    private String productServiceUrl;

    @PostConstruct
    public void seedRecommendations() {
        if (behaviorRepository.count() > 0 && cooccurrenceRepository.count() > 0) {
            return;
        }

        log.info("Seeding recommendation data...");

        String pidHeadphones = resolveProductId("Sony WH-1000XM5 Headphones");
        String pidMouse = resolveProductId("Logitech MX Master 3 Mouse");
        String pidMonitor = resolveProductId("Samsung 27\" 4K Monitor");
        String pidKeyboard = resolveProductId("Keychron K2 Mechanical Keyboard");
        String pidCharger = resolveProductId("Anker 65W GaN Charger");

        if (pidHeadphones != null) seedBehavior("demo-user-123", pidHeadphones, "PURCHASE");
        if (pidMouse != null) seedBehavior("demo-user-123", pidMouse, "PURCHASE");

        if (pidHeadphones != null && pidCharger != null) {
            seedCooccurrence(pidHeadphones, pidCharger, 15);
            seedCooccurrence(pidCharger, pidHeadphones, 15);
        }
        
        if (pidMouse != null && pidKeyboard != null) {
            seedCooccurrence(pidMouse, pidKeyboard, 25);
            seedCooccurrence(pidKeyboard, pidMouse, 25);
        }

        if (pidMonitor != null && pidKeyboard != null) {
            seedCooccurrence(pidMonitor, pidKeyboard, 20);
            seedCooccurrence(pidKeyboard, pidMonitor, 20);
        }

        if (pidMonitor != null && pidMouse != null) {
            seedCooccurrence(pidMonitor, pidMouse, 18);
            seedCooccurrence(pidMouse, pidMonitor, 18);
        }
    }

    private String resolveProductId(String productName) {
        try {
            String url = productServiceUrl + "/api/products?search=" 
                       + URLEncoder.encode(productName, StandardCharsets.UTF_8)
                       + "&size=1";
            Map response = restTemplate.getForObject(url, Map.class);
            if (response != null && response.get("content") != null) {
                List<Map<String, Object>> content = (List<Map<String, Object>>) response.get("content");
                if (!content.isEmpty()) {
                    return (String) content.get(0).get("id");
                }
            }
        } catch (Exception ex) {
            log.warn("Failed to resolve product ID for '{}': {}", productName, ex.getMessage());
        }
        return null;
    }

    private void seedBehavior(String userId, String productId, String action) {
        UserBehavior behavior = new UserBehavior();
        behavior.setUserId(userId);
        behavior.setProductId(productId);
        behavior.setAction(action);
        behavior.setTimestamp(LocalDateTime.now());
        behaviorRepository.save(behavior);
    }

    private void seedCooccurrence(String idA, String idB, int count) {
        ProductCooccurrence cooc = new ProductCooccurrence();
        cooc.setProductIdA(idA);
        cooc.setProductIdB(idB);
        cooc.setCount(count);
        cooccurrenceRepository.save(cooc);
    }
}
