package com.shopnest.recommendationservice.dto;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.List;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class BundleSuggestion {
    private List<String> productIds;
    private List<String> productNames;
    private double suggestedDiscount;
}
