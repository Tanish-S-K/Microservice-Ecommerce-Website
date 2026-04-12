package com.shopnest.cartservice.dto;

import lombok.Data;

import java.util.List;

@Data
public class BundleCheckResponse {
    private String bundleId;
    private String bundleName;
    private String description;
    private boolean matched;
    private double discountPercent;
    private double discountAmount;
    private List<String> productIds;
}
