package com.shopnest.cartservice.dto;

import lombok.Data;

@Data
public class Product {
    private String id;
    private String name;
    private double price;
    private String imageUrl;
    private String category;
}
