package com.shopnest.recommendationservice.service;

import com.shopnest.recommendationservice.dto.*;
import com.shopnest.recommendationservice.model.ProductCooccurrence;
import com.shopnest.recommendationservice.model.UserBehavior;
import com.shopnest.recommendationservice.repository.ProductCooccurrenceRepository;
import com.shopnest.recommendationservice.repository.UserBehaviorRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.data.domain.PageRequest;
import org.springframework.http.ResponseEntity;
import org.springframework.stereotype.Service;
import org.springframework.web.client.RestTemplate;

import java.time.LocalDateTime;
import java.util.*;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
@Slf4j
public class RecommendationService {

    private final UserBehaviorRepository behaviorRepository;
    private final ProductCooccurrenceRepository cooccurrenceRepository;
    private final RestTemplate restTemplate;

    @Value("${services.product.url}")
    private String productServiceUrl;

    public void recordBehavior(BehaviorRequest request) {
        UserBehavior behavior = new UserBehavior();
        behavior.setUserId(request.getUserId());
        behavior.setProductId(request.getProductId());
        behavior.setAction(request.getAction());
        behavior.setTimestamp(LocalDateTime.now());
        behaviorRepository.save(behavior);
    }

    public RecommendationResponse getRecommendations(String userId) {
        List<String> userProductIds = behaviorRepository
                .findByUserIdAndActionIn(userId, List.of("PURCHASE", "ADD_TO_CART"))
                .stream().map(UserBehavior::getProductId)
                .distinct().collect(Collectors.toList());

        if (userProductIds.isEmpty()) {
            return new RecommendationResponse(fetchFallbackProductIds(8));
        }

        Set<String> recommendedIds = new LinkedHashSet<>();
        for (String pid : userProductIds) {
            List<ProductCooccurrence> coocs = cooccurrenceRepository.findByProductIdAOrderByCountDesc(pid);
            coocs.stream()
                    .map(ProductCooccurrence::getProductIdB)
                    .filter(id -> !userProductIds.contains(id))
                    .limit(4)
                    .forEach(recommendedIds::add);
            if (recommendedIds.size() >= 8) {
                break;
            }
        }

        if (recommendedIds.size() < 8) {
            for (String id : fetchFallbackProductIds(8)) {
                if (!userProductIds.contains(id)) {
                    recommendedIds.add(id);
                }
                if (recommendedIds.size() >= 8) {
                    break;
                }
            }
        }

        return new RecommendationResponse(new ArrayList<>(recommendedIds).subList(0, Math.min(8, recommendedIds.size())));
    }

    public RecommendationResponse getSimilarProducts(String productId) {
        List<String> similarIds = cooccurrenceRepository
                .findByProductIdAOrderByCountDesc(productId)
                .stream().map(ProductCooccurrence::getProductIdB)
                .limit(6).collect(Collectors.toList());
        return new RecommendationResponse(similarIds);
    }

    public void updateCooccurrence(CooccurrenceRequest request) {
        List<String> ids = Optional.ofNullable(request.getProductIds()).orElse(List.of());
        for (int i = 0; i < ids.size(); i++) {
            for (int j = i + 1; j < ids.size(); j++) {
                String a = ids.get(i);
                String b = ids.get(j);
                upsertCooccurrence(a, b);
                upsertCooccurrence(b, a);
            }
        }
    }

    public List<BundleSuggestion> suggestBundles() {
        List<ProductCooccurrence> topPairs = cooccurrenceRepository.findAllByOrderByCountDesc(PageRequest.of(0, 10));
        List<Set<String>> bundles = new ArrayList<>();
        List<Integer> bundleScores = new ArrayList<>();

        for (ProductCooccurrence pair : topPairs) {
            boolean added = false;
            for (int i = 0; i < bundles.size(); i++) {
                Set<String> bundle = bundles.get(i);
                if (bundle.size() < 3 &&
                        (bundle.contains(pair.getProductIdA()) || bundle.contains(pair.getProductIdB()))) {
                    bundle.add(pair.getProductIdA());
                    bundle.add(pair.getProductIdB());
                    bundleScores.set(i, Math.max(bundleScores.get(i), pair.getCount()));
                    added = true;
                    break;
                }
            }
            if (!added) {
                Set<String> newBundle = new LinkedHashSet<>();
                newBundle.add(pair.getProductIdA());
                newBundle.add(pair.getProductIdB());
                bundles.add(newBundle);
                bundleScores.add(pair.getCount());
            }
            if (bundles.size() >= 3) {
                break;
            }
        }

        List<BundleSuggestion> suggestions = new ArrayList<>();
        for (int i = 0; i < bundles.size(); i++) {
            List<String> productIds = new ArrayList<>(bundles.get(i));
            List<String> names = productIds.stream()
                    .map(this::fetchProductName)
                    .filter(Objects::nonNull)
                    .toList();
            double suggestedDiscount = Math.min(15, 10 + bundleScores.get(i) / 10.0);
            suggestions.add(new BundleSuggestion(productIds, names, suggestedDiscount));
        }
        return suggestions;
    }

    private void upsertCooccurrence(String a, String b) {
        ProductCooccurrence doc = cooccurrenceRepository.findByProductIdAAndProductIdB(a, b)
                .orElse(new ProductCooccurrence(null, a, b, 0));
        doc.setCount(doc.getCount() + 1);
        cooccurrenceRepository.save(doc);
    }

    private List<String> fetchFallbackProductIds(int limit) {
        try {
            ResponseEntity<ProductPageResponse> response = restTemplate.getForEntity(
                    productServiceUrl + "/api/products?page=0&size=" + limit,
                    ProductPageResponse.class
            );
            if (response.getBody() != null && response.getBody().getContent() != null) {
                return response.getBody().getContent().stream().map(Product::getId).collect(Collectors.toList());
            }
        } catch (Exception ex) {
            log.warn("Failed to fetch fallback products: {}", ex.getMessage());
        }
        return new ArrayList<>();
    }

    private String fetchProductName(String productId) {
        try {
            Product product = restTemplate.getForObject(productServiceUrl + "/api/products/" + productId, Product.class);
            return product != null ? product.getName() : null;
        } catch (Exception ex) {
            log.warn("Failed to enrich bundle product {}: {}", productId, ex.getMessage());
            return null;
        }
    }
}
