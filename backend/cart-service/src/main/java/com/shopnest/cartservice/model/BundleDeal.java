package com.shopnest.cartservice.model;

import lombok.Data;
import org.springframework.data.annotation.Id;
import org.springframework.data.mongodb.core.mapping.Document;

import java.time.LocalDateTime;
import java.util.List;

@Document(collection = "bundle_deals")
@Data
public class BundleDeal {
    @Id
    private String id;
    private String name;
    private String description;
    private List<String> productIds;
    private double discountPercent;
    private boolean active;
    private LocalDateTime expiresAt;
}
