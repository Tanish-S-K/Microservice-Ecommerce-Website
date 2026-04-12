package com.shopnest.recommendationservice.model;

import lombok.Data;
import org.springframework.data.annotation.Id;
import org.springframework.data.mongodb.core.mapping.Document;

import java.time.LocalDateTime;

@Document(collection = "user_behaviors")
@Data
public class UserBehavior {
    @Id
    private String id;
    private String userId;
    private String productId;
    private String action;
    private LocalDateTime timestamp;
}
