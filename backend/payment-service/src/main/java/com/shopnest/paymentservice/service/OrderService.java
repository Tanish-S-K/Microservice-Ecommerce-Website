package com.shopnest.paymentservice.service;

import com.shopnest.paymentservice.dto.CooccurrenceRequest;
import com.shopnest.paymentservice.dto.CreateOrderRequest;
import com.shopnest.paymentservice.model.Order;
import com.shopnest.paymentservice.model.PaymentDetails;
import com.shopnest.paymentservice.repository.OrderRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import org.springframework.web.client.RestTemplate;

import java.time.LocalDateTime;
import java.util.List;
import java.util.UUID;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
@Slf4j
public class OrderService {

    private final OrderRepository orderRepository;
    private final RestTemplate restTemplate;

    @Value("${services.recommendation.url}")
    private String recommendationServiceUrl;

    public Order createOrder(CreateOrderRequest request) {
        Order order = new Order();
        order.setUserId(request.getUserId());
        order.setItems(request.getItems());
        order.setSubtotal(request.getSubtotal());
        order.setDiscountAmount(request.getDiscountAmount());
        order.setTotal(request.getTotal());
        order.setPaymentMethod(request.getPaymentMethod());
        order.setShippingAddress(request.getShippingAddress());
        order.setStatus("CONFIRMED");
        order.setCreatedAt(LocalDateTime.now());

        PaymentDetails paymentDetails = new PaymentDetails();
        paymentDetails.setTransactionId(UUID.randomUUID().toString());
        paymentDetails.setStatus("SUCCESS");
        paymentDetails.setPaidAt(LocalDateTime.now());
        order.setPaymentDetails(paymentDetails);

        Order savedOrder = orderRepository.save(order);

        List<String> productIds = savedOrder.getItems().stream()
                .map(item -> item.getProductId())
                .collect(Collectors.toList());
        try {
            restTemplate.postForObject(
                    recommendationServiceUrl + "/api/recommendations/cooccurrence/update",
                    new CooccurrenceRequest(productIds),
                    Void.class
            );
        } catch (Exception e) {
            log.warn("Could not update cooccurrence: {}", e.getMessage());
        }

        return savedOrder;
    }

    public List<Order> getOrdersForUser(String userId) {
        return orderRepository.findByUserIdOrderByCreatedAtDesc(userId);
    }

    public Order getOrder(String orderId) {
        return orderRepository.findById(orderId)
                .orElseThrow(() -> new IllegalArgumentException("Order not found"));
    }

    public Order cancelOrder(String orderId) {
        Order order = getOrder(orderId);
        if (!"PENDING".equals(order.getStatus()) && !"CONFIRMED".equals(order.getStatus())) {
            throw new IllegalStateException("Order cannot be cancelled at this stage");
        }
        order.setStatus("CANCELLED");
        return orderRepository.save(order);
    }
}
