package com.shopnest.recommendationservice.repository;

import com.shopnest.recommendationservice.model.ProductCooccurrence;
import org.springframework.data.domain.Pageable;
import org.springframework.data.mongodb.repository.MongoRepository;

import java.util.List;
import java.util.Optional;

public interface ProductCooccurrenceRepository extends MongoRepository<ProductCooccurrence, String> {
    List<ProductCooccurrence> findByProductIdAOrderByCountDesc(String productIdA);
    Optional<ProductCooccurrence> findByProductIdAAndProductIdB(String a, String b);
    List<ProductCooccurrence> findAllByOrderByCountDesc(Pageable pageable);
}
