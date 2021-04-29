// package com.example.demo.domain.posts;

// import static org.assertj.core.api.Assertions.assertThat;

// import java.util.List;

// import org.junit.jupiter.api.AfterEach;
// import org.junit.jupiter.api.Test;
// import org.junit.jupiter.api.extension.ExtendWith;
// import org.mockito.junit.jupiter.MockitoExtension;
// import org.springframework.beans.factory.annotation.Autowired;
// import org.springframework.boot.test.context.SpringBootTest;

// @ExtendWith(MockitoExtension.class)
// @SpringBootTest
// public class PostsRepositoryTest {
  
//   @Autowired
//   PostsRepository postsRepository;

//   // Junit에서 단위 테스트가 끝날 때마다 수행되는 method
//   // 데이터 침범을 막기위해 사용
//   // H2에 데이터가 그대로 남아있어 테스트가 실패할 수 있음
//   @AfterEach
//   public void cleanup() {
//     postsRepository.deleteAll();
//   }

//   @Test
//   public void board_save() {
//     String title = "test_title";
//     String content = "test_content";

//     // posts 테이블에 insert/update 실행
//     postsRepository.save(Posts.builder()
//                                 .title(title)
//                                 .content(content)
//                                 .author("test@gmail.com")
//                                 .build());

//     // posts 테이블에 모든 데이터를 조회
//     List<Posts> postsList = postsRepository.findAll();

//     Posts posts = postsList.get(0);
//     assertThat(posts.getTitle()).isEqualTo(title);
//     assertThat(posts.getContent()).isEqualTo(content);
//   }

// }
