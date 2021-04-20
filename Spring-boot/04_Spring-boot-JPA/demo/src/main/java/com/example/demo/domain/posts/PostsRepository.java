package com.example.demo.domain.posts;

import org.springframework.data.jpa.repository.JpaRepository;

// Posts 클래스로 DB를 접근하게 해줄 JPA Repository (반드시 Entity 클래스와 함께 위치)
// MyBatis에서의 DAO. JPA에서는 Repository라고 부름
// interface를 생성 후 JpaRepository<Entity, PK>를 상속하면 기본적인 CRUD method가 자동 생성
public interface PostsRepository extends JpaRepository<Posts, Long>{
  
}
