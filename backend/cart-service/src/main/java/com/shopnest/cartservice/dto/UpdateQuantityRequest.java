package com.shopnest.cartservice.dto;

import lombok.Data;

@Data
public class UpdateQuantityRequest {
    private String productId;
    private int quantity;
}
