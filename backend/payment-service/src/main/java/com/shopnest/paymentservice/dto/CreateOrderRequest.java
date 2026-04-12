package com.shopnest.paymentservice.dto;

import com.shopnest.paymentservice.model.OrderItem;
import lombok.Data;

import java.util.List;

@Data
public class CreateOrderRequest {
    private String userId;
    private List<OrderItem> items;
    private double subtotal;
    private double discountAmount;
    private double total;
    private String paymentMethod;
    private String shippingAddress;
}
