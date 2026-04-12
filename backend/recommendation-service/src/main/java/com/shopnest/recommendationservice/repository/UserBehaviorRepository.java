package com.shopnest.recommendationservice.repository;

import com.shopnest.recommendationservice.model.UserBehavior;
import org.springframework.data.mongodb.repository.MongoRepository;

import java.util.List;

public interface UserBehaviorRepository extends MongoRepository<UserBehavior, String> {
    List<UserBehavior> findByUserIdAndActionIn(String userId, List<String> actions);
}
