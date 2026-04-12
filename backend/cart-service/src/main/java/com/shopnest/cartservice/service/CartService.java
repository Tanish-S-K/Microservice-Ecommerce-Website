package com.shopnest.cartservice.service;

import com.shopnest.cartservice.dto.AddItemRequest;
import com.shopnest.cartservice.dto.BundleCheckResponse;
import com.shopnest.cartservice.dto.Product;
import com.shopnest.cartservice.dto.UpdateQuantityRequest;
import com.shopnest.cartservice.model.BundleDeal;
import com.shopnest.cartservice.model.Cart;
import com.shopnest.cartservice.model.CartItem;
import com.shopnest.cartservice.repository.BundleDealRepository;
import com.shopnest.cartservice.repository.CartRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import org.springframework.web.client.RestTemplate;

import java.time.LocalDateTime;
import java.util.*;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
@Slf4j
public class CartService {

    private final CartRepository cartRepository;
    private final BundleDealRepository bundleDealRepository;
    private final RestTemplate restTemplate;

    @Value("${services.product.url}")
    private String productServiceUrl;

    public Cart getCart(String userId) {
        return cartRepository.findByUserId(userId).orElseGet(() -> {
            Cart cart = new Cart();
            cart.setUserId(userId);
            cart.setItems(new ArrayList<>());
            cart.setUpdatedAt(LocalDateTime.now());
            return cart;
        });
    }

    public Cart addItem(String userId, AddItemRequest request) {
        Cart cart = cartRepository.findByUserId(userId).orElseGet(() -> {
            Cart newCart = new Cart();
            newCart.setUserId(userId);
            return newCart;
        });

        List<CartItem> items = Optional.ofNullable(cart.getItems()).orElseGet(ArrayList::new);
        CartItem existing = items.stream()
                .filter(item -> item.getProductId().equals(request.getProductId()))
                .findFirst()
                .orElse(null);

        if (existing != null) {
            existing.setQuantity(existing.getQuantity() + request.getQuantity());
        } else {
            CartItem item = new CartItem();
            item.setProductId(request.getProductId());
            item.setProductName(request.getProductName());
            item.setPrice(request.getPrice());
            item.setQuantity(request.getQuantity());
            item.setImageUrl(request.getImageUrl());
            items.add(item);
        }

        cart.setItems(items);
        cart.setUpdatedAt(LocalDateTime.now());
        return cartRepository.save(cart);
    }

    public Cart updateItem(String userId, UpdateQuantityRequest request) {
        Cart cart = cartRepository.findByUserId(userId).orElseGet(() -> {
            Cart newCart = new Cart();
            newCart.setUserId(userId);
            newCart.setItems(new ArrayList<>());
            return newCart;
        });

        List<CartItem> items = Optional.ofNullable(cart.getItems()).orElseGet(ArrayList::new);
        items.removeIf(item -> item.getProductId().equals(request.getProductId()) && request.getQuantity() <= 0);
        items.stream()
                .filter(item -> item.getProductId().equals(request.getProductId()))
                .findFirst()
                .ifPresent(item -> item.setQuantity(request.getQuantity()));

        cart.setItems(items);
        cart.setUpdatedAt(LocalDateTime.now());
        return cartRepository.save(cart);
    }

    public void removeItem(String userId, String productId) {
        cartRepository.findByUserId(userId).ifPresent(cart -> {
            cart.getItems().removeIf(item -> item.getProductId().equals(productId));
            cart.setUpdatedAt(LocalDateTime.now());
            cartRepository.save(cart);
        });
    }

    public void clearCart(String userId) {
        cartRepository.findByUserId(userId).ifPresent(cart -> {
            cart.setItems(new ArrayList<>());
            cart.setUpdatedAt(LocalDateTime.now());
            cartRepository.save(cart);
        });
    }

    public List<BundleDeal> getActiveBundles() {
        return bundleDealRepository.findByActiveTrue().stream()
                .filter(bundle -> bundle.getExpiresAt() == null || bundle.getExpiresAt().isAfter(LocalDateTime.now()))
                .toList();
    }

    public BundleDeal createBundle(BundleDeal bundleDeal) {
        return bundleDealRepository.save(bundleDeal);
    }

    public List<BundleCheckResponse> checkBundles(String userId) {
        Cart cart = cartRepository.findByUserId(userId).orElse(null);
        if (cart == null || cart.getItems() == null || cart.getItems().isEmpty()) {
            return Collections.emptyList();
        }

        Set<String> cartProductIds = cart.getItems().stream()
                .map(CartItem::getProductId)
                .collect(Collectors.toSet());

        List<BundleDeal> activeBundles = bundleDealRepository.findByActiveTrue();
        List<BundleCheckResponse> result = new ArrayList<>();

        for (BundleDeal bundle : activeBundles) {
            boolean allPresent = cartProductIds.containsAll(bundle.getProductIds());
            if (allPresent) {
                double discountAmount = cart.getItems().stream()
                        .filter(item -> bundle.getProductIds().contains(item.getProductId()))
                        .mapToDouble(item -> resolveCurrentItemPrice(item.getProductId(), item.getPrice()) * item.getQuantity())
                        .sum() * bundle.getDiscountPercent() / 100;

                BundleCheckResponse resp = new BundleCheckResponse();
                resp.setBundleId(bundle.getId());
                resp.setBundleName(bundle.getName());
                resp.setDescription(bundle.getDescription());
                resp.setMatched(true);
                resp.setDiscountPercent(bundle.getDiscountPercent());
                resp.setDiscountAmount(Math.round(discountAmount * 100.0) / 100.0);
                resp.setProductIds(bundle.getProductIds());
                result.add(resp);
            }
        }
        return result;
    }

    private double resolveCurrentItemPrice(String productId, double fallbackPrice) {
        try {
            Product product = restTemplate.getForObject(productServiceUrl + "/api/products/" + productId, Product.class);
            return product != null ? product.getPrice() : fallbackPrice;
        } catch (Exception ex) {
            log.warn("Could not fetch product {} for bundle pricing: {}", productId, ex.getMessage());
            return fallbackPrice;
        }
    }
}
