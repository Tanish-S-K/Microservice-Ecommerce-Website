package com.shopnest.productservice.config;

import com.shopnest.productservice.model.Product;
import com.shopnest.productservice.repository.ProductRepository;
import jakarta.annotation.PostConstruct;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Component;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Locale;

@Component
@RequiredArgsConstructor
public class DataSeeder {

    private final ProductRepository productRepository;

    @PostConstruct
    public void seedData() {
        if (productRepository.count() > 0) {
            return;
        }

        productRepository.saveAll(List.of(
                product("Sony WH-1000XM5 Headphones", "Industry-leading noise cancellation with 30hr battery", 24999, "Electronics", 45, 4.8, 1280, List.of("electronics", "audio", "wireless")),
                product("Logitech MX Master 3 Mouse", "Advanced wireless mouse for power users", 6999, "Electronics", 80, 4.7, 920, List.of("electronics", "computer", "wireless")),
                product("Samsung 27\" 4K Monitor", "Ultra HD IPS panel with USB-C connectivity", 32999, "Electronics", 30, 4.6, 460, List.of("electronics", "display", "computer")),
                product("Keychron K2 Mechanical Keyboard", "Compact wireless mechanical keyboard with RGB", 8499, "Electronics", 60, 4.5, 710, List.of("electronics", "computer", "keyboard")),
                product("Anker 65W GaN Charger", "Fast charging 3-port desktop charger", 2999, "Electronics", 120, 4.4, 510, List.of("electronics", "charging", "accessories")),
                product("Levi's 511 Slim Fit Jeans", "Classic slim fit denim jeans in dark wash", 3499, "Clothing", 200, 4.3, 870, List.of("clothing", "jeans", "casual")),
                product("Nike Dri-FIT Running T-Shirt", "Moisture-wicking performance tee", 1299, "Clothing", 300, 4.2, 640, List.of("clothing", "sports", "running")),
                product("Puma RS-X Sneakers", "Bold chunky sneakers with retro runner DNA", 7999, "Clothing", 90, 4.4, 500, List.of("clothing", "footwear", "sports")),
                product("H&M Slim Fit Chinos", "Stretch chinos in khaki for everyday wear", 1799, "Clothing", 150, 4.1, 380, List.of("clothing", "casual", "office")),
                product("Instant Pot Duo 7-in-1", "7-in-1 electric pressure cooker, 6 quart", 8999, "Home & Kitchen", 55, 4.7, 930, List.of("kitchen", "cooking", "appliance")),
                product("Philips Air Fryer HD9200", "1500W rapid air technology, 4.1L capacity", 6499, "Home & Kitchen", 70, 4.5, 820, List.of("kitchen", "cooking", "healthy")),
                product("IKEA KALLAX Shelf Unit", "Versatile cube storage in white, 4 compartments", 4999, "Home & Kitchen", 40, 4.3, 410, List.of("home", "storage", "furniture")),
                product("Milton Thermosteel Flask 1L", "24hr hot and cold insulated bottle", 899, "Home & Kitchen", 250, 4.4, 1180, List.of("kitchen", "bottle", "everyday")),
                product("Atomic Habits by James Clear", "Tiny changes, remarkable results — the ultimate habit guide", 499, "Books", 500, 4.8, 3020, List.of("books", "self-help", "productivity")),
                product("The Pragmatic Programmer", "Your journey to mastery, 20th anniversary edition", 1299, "Books", 200, 4.7, 1420, List.of("books", "programming", "career")),
                product("Sapiens by Yuval Noah Harari", "A brief history of humankind", 599, "Books", 350, 4.6, 2210, List.of("books", "history", "nonfiction")),
                product("Deep Work by Cal Newport", "Rules for focused success in a distracted world", 449, "Books", 280, 4.5, 1870, List.of("books", "productivity", "focus")),
                product("Boldfit Gym Gloves", "Anti-slip grip gloves with wrist support", 399, "Sports", 400, 4.2, 690, List.of("sports", "gym", "fitness")),
                product("Lifelong Yoga Mat 6mm", "Non-slip EVA foam yoga mat with carry strap", 799, "Sports", 180, 4.3, 760, List.of("sports", "yoga", "fitness")),
                product("Cosco Volleyball", "Official size and weight synthetic leather ball", 1199, "Sports", 100, 4.1, 330, List.of("sports", "outdoor", "team"))
        ));
    }

    private Product product(String name, String description, double price, String category, int stock, double rating,
                            int reviewCount, List<String> tags) {
        Product product = new Product();
        product.setName(name);
        product.setDescription(description);
        product.setPrice(price);
        product.setCategory(category);
        product.setImageUrl("https://picsum.photos/seed/" + slugify(name) + "/400/400");
        product.setStock(stock);
        product.setRating(rating);
        product.setReviewCount(reviewCount);
        product.setTags(tags);
        product.setCreatedAt(LocalDateTime.now());
        return product;
    }

    private String slugify(String value) {
        return value.toLowerCase(Locale.ROOT)
                .replaceAll("[^a-z0-9]+", "-")
                .replaceAll("(^-|-$)", "");
    }
}
