package com.shopnest.cartservice.config;

import com.shopnest.cartservice.dto.ProductPageResponse;
import com.shopnest.cartservice.model.BundleDeal;
import com.shopnest.cartservice.repository.BundleDealRepository;
import jakarta.annotation.PostConstruct;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.ResponseEntity;
import org.springframework.stereotype.Component;
import org.springframework.web.client.RestTemplate;

import java.net.URLEncoder;
import java.nio.charset.StandardCharsets;
import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;

@Component
@RequiredArgsConstructor
@Slf4j
public class BundleSeeder {

    private final BundleDealRepository bundleDealRepository;
    private final RestTemplate restTemplate;

    @Value("${services.product.url}")
    private String productServiceUrl;

    @PostConstruct
    public void seedBundles() {
        if (bundleDealRepository.count() > 0) {
            return;
        }

        createBundle("Gaming Setup Bundle", "Complete your battle station",
                List.of("Samsung 27\" 4K Monitor", "Keychron K2 Mechanical Keyboard", "Logitech MX Master 3 Mouse"),
                12);
        createBundle("Fitness Starter Pack", "Everything to kickstart your fitness journey",
                List.of("Boldfit Gym Gloves", "Lifelong Yoga Mat 6mm", "Nike Dri-FIT Running T-Shirt"),
                10);
        createBundle("Developer's Productivity Kit", "Read, focus, and code better",
                List.of("Atomic Habits by James Clear", "Deep Work by Cal Newport", "The Pragmatic Programmer"),
                15);
    }

    private void createBundle(String name, String description, List<String> productNames, double discountPercent) {
        List<String> productIds = new ArrayList<>();
        for (String productName : productNames) {
            try {
                ResponseEntity<ProductPageResponse> response = restTemplate.getForEntity(
                        productServiceUrl + "/api/products?search="
                                + URLEncoder.encode(productName, StandardCharsets.UTF_8)
                                + "&size=1",
                        ProductPageResponse.class
                );
                if (response.getBody() != null
                        && response.getBody().getContent() != null
                        && !response.getBody().getContent().isEmpty()) {
                    productIds.add(response.getBody().getContent().get(0).getId());
                }
            } catch (Exception ex) {
                log.warn("Failed to resolve product '{}' while seeding bundles: {}", productName, ex.getMessage());
            }
        }

        if (productIds.size() != productNames.size()) {
            log.warn("Skipping bundle '{}' because not all product IDs could be resolved", name);
            return;
        }

        BundleDeal bundleDeal = new BundleDeal();
        bundleDeal.setName(name);
        bundleDeal.setDescription(description);
        bundleDeal.setProductIds(productIds);
        bundleDeal.setDiscountPercent(discountPercent);
        bundleDeal.setActive(true);
        bundleDeal.setExpiresAt(LocalDateTime.now().plusDays(30));
        bundleDealRepository.save(bundleDeal);
    }
}
