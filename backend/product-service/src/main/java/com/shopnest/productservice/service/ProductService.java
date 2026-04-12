package com.shopnest.productservice.service;

import com.shopnest.productservice.dto.ProductPageResponse;
import com.shopnest.productservice.model.Product;
import com.shopnest.productservice.repository.ProductRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.PageImpl;
import org.springframework.data.domain.PageRequest;
import org.springframework.stereotype.Service;
import org.springframework.util.StringUtils;

import java.util.Comparator;
import java.util.List;
import java.util.Locale;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class ProductService {

    private final ProductRepository productRepository;

    public ProductPageResponse getProducts(String category, String search, int page, int size, String sort) {
        List<Product> filtered = productRepository.findAll().stream()
                .filter(product -> !StringUtils.hasText(category) || product.getCategory().equalsIgnoreCase(category))
                .filter(product -> {
                    if (!StringUtils.hasText(search)) {
                        return true;
                    }
                    String query = search.toLowerCase(Locale.ROOT);
                    return product.getName().toLowerCase(Locale.ROOT).contains(query)
                            || product.getDescription().toLowerCase(Locale.ROOT).contains(query);
                })
                .collect(Collectors.toList());

        Comparator<Product> comparator = switch (sort == null ? "" : sort) {
            case "price_asc" -> Comparator.comparingDouble(Product::getPrice);
            case "price_desc" -> Comparator.comparingDouble(Product::getPrice).reversed();
            case "rating" -> Comparator.comparingDouble(Product::getRating).reversed();
            default -> Comparator.comparing(Product::getCreatedAt).reversed();
        };

        filtered = filtered.stream().sorted(comparator).toList();

        int start = Math.min(page * size, filtered.size());
        int end = Math.min(start + size, filtered.size());
        List<Product> content = filtered.subList(start, end);

        PageImpl<Product> pageResult = new PageImpl<>(content, PageRequest.of(page, size), filtered.size());
        return new ProductPageResponse(
                pageResult.getContent(),
                pageResult.getTotalPages(),
                pageResult.getTotalElements(),
                page
        );
    }

    public Product getProduct(String id) {
        return productRepository.findById(id)
                .orElseThrow(() -> new IllegalArgumentException("Product not found"));
    }

    public List<String> getCategories() {
        return productRepository.findAll().stream()
                .map(Product::getCategory)
                .distinct()
                .sorted()
                .toList();
    }

    public Product createProduct(Product product) {
        product.setId(null);
        return productRepository.save(product);
    }

    public Product updateProduct(String id, Product updated) {
        Product existing = getProduct(id);
        existing.setName(updated.getName());
        existing.setDescription(updated.getDescription());
        existing.setPrice(updated.getPrice());
        existing.setCategory(updated.getCategory());
        existing.setImageUrl(updated.getImageUrl());
        existing.setStock(updated.getStock());
        existing.setRating(updated.getRating());
        existing.setReviewCount(updated.getReviewCount());
        existing.setTags(updated.getTags());
        existing.setCreatedAt(updated.getCreatedAt() != null ? updated.getCreatedAt() : existing.getCreatedAt());
        return productRepository.save(existing);
    }

    public void deleteProduct(String id) {
        productRepository.deleteById(id);
    }
}
