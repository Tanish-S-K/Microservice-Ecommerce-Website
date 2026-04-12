package com.shopnest.cartservice.repository;

import com.shopnest.cartservice.model.BundleDeal;
import org.springframework.data.mongodb.repository.MongoRepository;

import java.util.List;

public interface BundleDealRepository extends MongoRepository<BundleDeal, String> {
    List<BundleDeal> findByActiveTrue();
}
