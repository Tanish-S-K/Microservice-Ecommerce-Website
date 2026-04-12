package com.shopnest.recommendationservice.dto;

import lombok.Data;

import java.util.List;

@Data
public class CooccurrenceRequest {
    private List<String> productIds;
}
