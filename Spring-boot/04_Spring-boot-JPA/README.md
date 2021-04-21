# Spring-boot JPA
## 🎁 목차
- [Spring-boot JPA](#spring-boot-jpa)
  - [🎁 목차](#-목차)
  - [0. 개요](#0-개요)
  - [1. Dependency 추가](#1-dependency-추가)
  - [2. Entity 작성](#2-entity-작성)
  - [3. Repository 작성](#3-repository-작성)
  - [4. application.properties 수정](#4-applicationproperties-수정)
  - [5. 테스트코드 작성](#5-테스트코드-작성)
  - [4. 테스트](#4-테스트)
  - [5. 실행](#5-실행)
  
## 0. 개요
**JPA (Java Persistence API)** Spring-boot에서 RDB의 관리를 용이하게 해주는 API이다. (= 자바 표준 ORM) 
ORM(Object Relational Mapping): DB와 객체 지향 프로그래밍 간의 데이터를 변환하는 프로그래밍 기법
  
## 1. Dependency 추가
`build.gradle`에 다음을 추가한다.
```groovy
dependencies {
	implementation 'org.springframework.boot:spring-boot-starter-data-jpa'
	implementation 'com.h2database:h2'
}
```
- `spring-boot-starter-data-jpa`
  - JPA 라이브러리
- `h2`
  - 인메모리 RDB

## 2. Entity 작성
1. package 생성
`domain/posts`폴더를 만든다
2. entity class 생성
해당 폴더 아래에 `Posts.java`를 만든다.
```java
package com.example.demo.domain.posts;

import javax.persistence.Column;
import javax.persistence.Entity;
import javax.persistence.GeneratedValue;
import javax.persistence.GenerationType;
import javax.persistence.Id;

import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;


@Getter
@NoArgsConstructor                                       
@Entity                                                   
public class Posts {

  @Id  
  @GeneratedValue(strategy = GenerationType.IDENTITY)     
  private Long id;

  @Column(length = 500, nullable = false)                   
  private String title;

  @Column(columnDefinition = "TEXT", nullable = false)
  private String content;

  private String author;

  @Builder
  public Posts(String title, String content, String author){
    this.title = title;
    this.content = content;
    this.author = author;
  }
}
```
- Entity 클래스에서는 절대 Setter method를 만들지 않는다.
  - 대신 해당 필드의 변경이 필요할때 명확히 그 목적과 의도를 나타낼 수 있는 method를 추가해야 한다.
  - DB 삽입: 생성자를 통해 삽입한다.
  - DB 변경: 해당 이벤트에 맞는 public method 호출
- `@NoArgsConstructor`
  - 기본 생성자 자동 추가
  - public Post(){} 와 동일효과
- `@Entity`
  - 테이블과 링크될 클래스임을 명시
  - default: CamelCase -> under_score_naming 으로 테이블 이름 매칭
- `@Id`
  - 해당 테이블의 PK필드  
- `@GeneratedValue(strategy = GenerationType.IDENTITY)`
  - PK의 생성 규칙을 나타낸다. 
  - 스프링부트 2.0에서는 GenerationType.IDENTITY 옵션을 추가해야 auto_increment
  - GenerationType.AUTO (default) 옵션은 테이블에서 시퀀스 값을 가져와 업데이트하고, 해당 값으로 id 생성
- `@Column(length = 500, nullable = false)`
  - 테이블의 칼럼을 나타낸다.
  - 굳이 선언하지 않아도 이 클래스의 모든 필드는 칼럼이 된다.
  - 추가로 변경이 필요한 옵션이 있을때 사용한다.
- `@Builder`
  - 생성자 상단에 선언 시 생성자에 포함된 필드만 빌더에 포함
  
## 3. Repository 작성
1. repository class 생성
`domain/posts` 폴더 아래에 `PostsRepository.java`를 만든다.
```java
package com.example.demo.domain.posts;

import org.springframework.data.jpa.repository.JpaRepository;

public interface PostsRepository extends JpaRepository<Posts, Long>{
}
```
- Posts 클래스로 DB를 접근하게 해줄 JPA Repository (반드시 Entity 클래스와 함께 위치)
- MyBatis에서의 DAO. JPA에서는 Repository라고 부름
- interface를 생성 후 JpaRepository<Entity, PK>를 상속하면 기본적인 CRUD method가 자동 생성

## 4. application.properties 수정
`application.properties`에 다음을 추가한다.
```properties
# 실행되는 쿼리 로그
spring.jpa.show-sql=true
# H2문법 로그를 MySQL문법 로그로 출력
spring.jpa.properties.hibernate.dialect=org.hibernate.dialect.MySQL5InnoDBDialect
spring.jpa.properties.hibernate.dialect.storage_engine=innodb
spring.datasource.hikari.jdbc-url=jdbc:h2:mem:testdb;MODE=MYSQL
spring.datasource.hikari.username=rivernine
```

## 5. 테스트코드 작성
1. package 생성
`test`아래에 동일 구조의 폴더를 만든다. `domain/posts`
2. test class 생성
해당 폴더 아래에 `PostsRepositoryTest.java`를 만든다.
```java
package com.example.demo.domain.posts;

import static org.assertj.core.api.Assertions.assertThat;

import java.util.List;

import org.junit.jupiter.api.AfterEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;

@ExtendWith(MockitoExtension.class)
@SpringBootTest
public class PostsRepositoryTest {
  
  @Autowired
  PostsRepository postsRepository;
  
  @AfterEach
  public void cleanup() {
    postsRepository.deleteAll();
  }

  @Test
  public void board_save() {
    String title = "test_title";
    String content = "test_content";
    
    postsRepository.save(Posts.builder()
                                .title(title)
                                .content(content)
                                .author("test@gmail.com")
                                .build());
    
    List<Posts> postsList = postsRepository.findAll();

    Posts posts = postsList.get(0);
    assertThat(posts.getTitle()).isEqualTo(title);
    assertThat(posts.getContent()).isEqualTo(content);
  }
}
```
- `@AfterEach`
  - Junit에서 단위 테스트가 끝날 때마다 수행되는 method
  - 데이터 침범을 막기위해 사용
  - H2에 데이터가 그대로 남아있어 테스트가 실패하는 것을 방지
- `postsRepository.save()`
  - posts 테이블에 insert/update 실행
- `postsRepository.findAll()`
  - posts 테이블에 모든 데이터를 조회

## 4. 테스트
`Run Test`를 누르면 unit test를 진행할 수 있다.

1. 결과 확인
`디버크 콘솔`을 확인하자.
Spring-boot application이 실행되고 Hibernate의 로그를 확인할 수 있다.
![1](./1.PNG)

* 인메모리 DB를 만들어 테스트를 하고 `@AfterEach`로 지정해준 method를 실행하는 것을 확인할 수 있다.

## 5. 실행
```sh
# 빌드
./gradlew build
# Spring-boot 실행
java -jar ./build/lib/*.jar
```

---
*참고서적: 스프링부트와 AWS로 혼자 구현하는 웹 서비스*
