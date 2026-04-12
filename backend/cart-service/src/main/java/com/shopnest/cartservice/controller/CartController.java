package com.shopnest.cartservice.controller;

import com.shopnest.cartservice.dto.AddItemRequest;
import com.shopnest.cartservice.dto.BundleCheckResponse;
import com.shopnest.cartservice.dto.UpdateQuantityRequest;
import com.shopnest.cartservice.model.BundleDeal;
import com.shopnest.cartservice.model.Cart;
import com.shopnest.cartservice.service.CartService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/cart")
@RequiredArgsConstructor
public class CartController {

    private final CartService cartService;

    @GetMapping("/{userId}")
    public ResponseEntity<Cart> getCart(@PathVariable String userId) {
        return ResponseEntity.ok(cartService.getCart(userId));
    }

    @PostMapping("/{userId}/add")
    public ResponseEntity<Cart> addItem(@PathVariable String userId, @RequestBody AddItemRequest request) {
        return ResponseEntity.ok(cartService.addItem(userId, request));
    }

    @PutMapping("/{userId}/update")
    public ResponseEntity<Cart> updateItem(@PathVariable String userId, @RequestBody UpdateQuantityRequest request) {
        return ResponseEntity.ok(cartService.updateItem(userId, request));
    }

    @DeleteMapping("/{userId}/remove/{productId}")
    public ResponseEntity<Void> removeItem(@PathVariable String userId, @PathVariable String productId) {
        cartService.removeItem(userId, productId);
        return ResponseEntity.noContent().build();
    }

    @DeleteMapping("/{userId}/clear")
    public ResponseEntity<Void> clearCart(@PathVariable String userId) {
        cartService.clearCart(userId);
        return ResponseEntity.noContent().build();
    }

    @GetMapping("/bundles")
    public ResponseEntity<List<BundleDeal>> getBundles() {
        return ResponseEntity.ok(cartService.getActiveBundles());
    }

    @PostMapping("/bundles")
    public ResponseEntity<BundleDeal> createBundle(@RequestBody BundleDeal bundleDeal) {
        return ResponseEntity.ok(cartService.createBundle(bundleDeal));
    }

    @GetMapping("/bundles/check/{userId}")
    public ResponseEntity<List<BundleCheckResponse>> checkBundles(@PathVariable String userId) {
        return ResponseEntity.ok(cartService.checkBundles(userId));
    }
}
