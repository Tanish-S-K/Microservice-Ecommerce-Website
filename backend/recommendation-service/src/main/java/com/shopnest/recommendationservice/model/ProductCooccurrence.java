package com.shopnest.recommendationservice.model;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;
import org.springframework.data.annotation.Id;
import org.springframework.data.mongodb.core.mapping.Document;

@Document(collection = "product_cooccurrences")
@Data
@NoArgsConstructor
@AllArgsConstructor
public class ProductCooccurrence {
    @Id
    private String id;
    private String productIdA;
    private String productIdB;
    private int count;
}
