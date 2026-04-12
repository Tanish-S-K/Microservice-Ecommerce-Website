package com.shopnest.recommendationservice.dto;

import lombok.Data;

@Data
public class BehaviorRequest {
    private String userId;
    private String productId;
    private String action;
}
