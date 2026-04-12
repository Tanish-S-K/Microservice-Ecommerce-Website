package com.shopnest.paymentservice.model;

import lombok.Data;

@Data
public class OrderItem {
    private String productId;
    private String productName;
    private double price;
    private int quantity;
    private String imageUrl;
}
