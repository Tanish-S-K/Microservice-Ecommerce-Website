package com.shopnest.paymentservice.config;

import com.shopnest.paymentservice.model.Order;
import com.shopnest.paymentservice.model.OrderItem;
import com.shopnest.paymentservice.model.PaymentDetails;
import com.shopnest.paymentservice.repository.OrderRepository;
import jakarta.annotation.PostConstruct;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Component;
import org.springframework.web.client.RestTemplate;

import java.net.URLEncoder;
import java.nio.charset.StandardCharsets;
import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;
import java.util.Map;
import java.util.UUID;

@Component
@RequiredArgsConstructor
@Slf4j
public class OrderSeeder {

    private final OrderRepository orderRepository;
    private final RestTemplate restTemplate;

    @Value("${services.product.url:http://localhost:8082}")
    private String productServiceUrl;

    @PostConstruct
    public void seedOrder() {
        if (orderRepository.count() > 0) {
            return;
        }

        log.info("Seeding demo order for demo-user-123");

        List<OrderItem> items = new ArrayList<>();
        
        OrderItem item1 = createOrderItem("Sony WH-1000XM5 Headphones", 1);
        if (item1 != null) items.add(item1);

        OrderItem item2 = createOrderItem("Logitech MX Master 3 Mouse", 1);
        if (item2 != null) items.add(item2);

        if (items.isEmpty()) {
            log.warn("Could not fetch products for demo order. Skipping order seed.");
            return;
        }

        double subtotal = items.stream().mapToDouble(i -> i.getPrice() * i.getQuantity()).sum();

        Order order = new Order();
        order.setUserId("demo-user-123");
        order.setItems(items);
        order.setSubtotal(subtotal);
        order.setDiscountAmount(0);
        order.setTotal(subtotal);
        order.setStatus("DELIVERED");
        order.setPaymentMethod("CARD");
        order.setShippingAddress("123 Demo Street, Bangalore, Karnataka, 560001");
        order.setCreatedAt(LocalDateTime.now().minusDays(5));

        PaymentDetails paymentDetails = new PaymentDetails();
        paymentDetails.setTransactionId(UUID.randomUUID().toString());
        paymentDetails.setStatus("SUCCESS");
        paymentDetails.setPaidAt(LocalDateTime.now().minusDays(5));
        
        order.setPaymentDetails(paymentDetails);

        orderRepository.save(order);
    }

    private OrderItem createOrderItem(String productName, int quantity) {
        try {
            String url = productServiceUrl + "/api/products?search=" 
                       + URLEncoder.encode(productName, StandardCharsets.UTF_8)
                       + "&size=1";
            
            Map response = restTemplate.getForObject(url, Map.class);
            if (response != null && response.get("content") != null) {
                List<Map<String, Object>> content = (List<Map<String, Object>>) response.get("content");
                if (!content.isEmpty()) {
                    Map<String, Object> product = content.get(0);
                    
                    OrderItem item = new OrderItem();
                    item.setProductId((String) product.get("id"));
                    item.setProductName((String) product.get("name"));
                    item.setPrice(Double.parseDouble(product.get("price").toString()));
                    item.setQuantity(quantity);
                    item.setImageUrl((String) product.get("imageUrl"));
                    return item;
                }
            }
        } catch (Exception ex) {
            log.warn("Failed to fetch product for seed order: {}", ex.getMessage());
        }
        return null;
    }
}
