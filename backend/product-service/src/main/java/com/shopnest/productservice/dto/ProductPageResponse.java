package com.shopnest.productservice.dto;

import com.shopnest.productservice.model.Product;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.List;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class ProductPageResponse {
    private List<Product> content;
    private int totalPages;
    private long totalElements;
    private int currentPage;
}
