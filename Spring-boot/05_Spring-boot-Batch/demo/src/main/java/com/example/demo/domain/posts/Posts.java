package com.example.demo.domain.posts;

import javax.persistence.Column;
import javax.persistence.Entity;
import javax.persistence.GeneratedValue;
import javax.persistence.GenerationType;
import javax.persistence.Id;

import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;

// Entity 클래스에서는 절대 Setter method를 만들지 않는다.
// 대신 해당 필드의 변경이 필요할때 명확히 그 목적과 의도를 나타낼 수 있는 method를 추가해야 한다.
// DB 삽입: 생성자를 통해 삽입한다.
// DB 변경: 해당 이벤트에 맞는 public method 호출

@Getter
// 기본 생성자 자동 추가
// public Post(){} 와 동일효과
@NoArgsConstructor                                       
// 테이블과 링크될 클래스임을 명시
// default: CamelCase -> under_score_naming 으로 테이블 이름 매칭
@Entity                                                   
public class Posts {

  // 해당 테이블의 PK필드  
  @Id
  // PK의 생성 규칙을 나타낸다. 
  // 스프링부트 2.0에서는 GenerationType.IDENTITY 옵션을 추가해야 auto_increment
  // GenerationType.AUTO (default) 옵션은 테이블에서 시퀀스 값을 가져와 업데이트하고, 해당 값으로 id 생성
  @GeneratedValue(strategy = GenerationType.IDENTITY)     
  private Long id;

  // 테이블의 칼럼을 나타낸다.
  // 굳이 선언하지 않아도 이 클래스의 모든 필드는 칼럼이 된다.
  // 추가로 변경이 필요한 옵션이 있을때 사용한다.
  @Column(length = 500, nullable = false)                   
  private String title;

  @Column(columnDefinition = "TEXT", nullable = false)
  private String content;

  private String author;

  // 생성자 상단에 선언 시 생성자에 포함된 필드만 빌더에 포함
  @Builder
  public Posts(String title, String content, String author){
    this.title = title;
    this.content = content;
    this.author = author;
  }
}


