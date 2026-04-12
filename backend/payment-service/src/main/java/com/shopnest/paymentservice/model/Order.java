package com.shopnest.paymentservice.model;

import lombok.Data;
import org.springframework.data.annotation.Id;
import org.springframework.data.mongodb.core.mapping.Document;

import java.time.LocalDateTime;
import java.util.List;

@Document(collection = "orders")
@Data
public class Order {
    @Id
    private String id;
    private String userId;
    private List<OrderItem> items;
    private double subtotal;
    private double discountAmount;
    private double total;
    private String status;
    private String paymentMethod;
    private PaymentDetails paymentDetails;
    private String shippingAddress;
    private LocalDateTime createdAt;
}
