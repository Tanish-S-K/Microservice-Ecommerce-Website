package com.shopnest.paymentservice.model;

import lombok.Data;

import java.time.LocalDateTime;

@Data
public class PaymentDetails {
    private String transactionId;
    private String status;
    private LocalDateTime paidAt;
}
