package com.shopnest.cartservice.dto;

import lombok.Data;

import java.util.List;

@Data
public class ProductPageResponse {
    private List<Product> content;
    private int totalPages;
    private long totalElements;
    private int currentPage;
}
