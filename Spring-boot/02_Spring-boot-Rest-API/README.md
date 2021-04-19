# Spring-boot Rest API
## 🎁 목차
- [Spring-boot Rest API](#spring-boot-rest-api)
  - [🎁 목차](#-목차)
  - [0. 개요](#0-개요)
  - [1. dependeny 추가](#1-dependeny-추가)
  - [2. Controller 작성](#2-controller-작성)
  - [3. Test 작성](#3-test-작성)
## 0. 개요
* Spring-boot을 이용하여 간단한 Rest API를 작성한다.
* 프로젝트 생성은 [**이곳**](!https://velog.io/@rivernine/Spring-boot-Hello-world)을 참조한다.  
## 1. dependeny 추가
`build.gradle`에 다음을 추가한다.
```groovy
dependencies {
  implementation 'org.springframework.boot:spring-boot-starter-web'  
}
```

## 2. Controller 작성
1. package 생성
`/web/controller`폴더를 만든다.
2. controller class 생성
해당 폴더 아래에 `HelloController.java`를 만든다.
```java
package com.rivernine.demo.web.controller;

import org.springframework.web.bind.annotation.RestController;
import org.springframework.web.bind.annotation.GetMapping;

@RestController
public class HelloController {

  @GetMapping("/hello")
  public String hello(){
    return "hello";
  }
}
```
- `@RestController` 
  - 컨트롤러를 JSON을 반환하게 해준다.(
  - 기존에는 `@ResponseBody`를 메소드마다 선언해 주었다.
- `@GetMapping`
  - HTTP method 중 Get 요청을 받을 수 있는 API를 만들어준다.
  - 기존에는 `@RequestMapping(method = RequestMethod.GET)`을 사용했음


## 3. Test 작성
1. package 생성
`test`아래에 동일 구조의 폴더를 만든다. `web/controller`
2. test controller class 생성
해당 폴더 아래에 `HelloControllerTest.java`를 만든다.
```java
package com.rivernine.demo.web.controller;

import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.content;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.WebMvcTest;
import org.springframework.test.web.servlet.MockMvc;

@ExtendWith(MockitoExtension.class)
@WebMvcTest
public class HelloControllerTest {
  
  @Autowired
  private MockMvc mvc;

  @Test
  public void return_hello() throws Exception {
    String hello = "hello";

    mvc.perform(get("/hello"))
              .andExpect(status().isOk())
              .andExpect(content().string(hello));
  }
```
- `@ExtendWith`
  - Spring-boot 테스트와 JUnit사이의 연결자이다.
- `@WebMvcTest`
  - 여러 Spring-boot 어노테이션 중 Web 어노테이션이다.
  - 선언할 경우 `@Controller`, `@ControllerAdvice`를 사용할 수 있다.
- `@Autowired`
  - Spring이 관리하는 Bean을 주입받는다.
- `private MockMvc mvc`
  - Spring MVC 테스트의 시작점이다.
  - 이 클래스를 통해 HTTP GET, POST등 API 테스트를 할 수 있다.
- `mvc.perform(get("/hello"))`
  - MockMvc를 통해 /hello 주소로 HTTP GET 요청을 한다.
- `.andExpect(status().isOk())`
  - `mvc.perform`의 결과를 검증한다.
  - HTTP Header의 Status를 검증한다.
- `.andExpect(content().string(hello))
  - `mvc.perform`의 결과를 검증한다.
  - 응답 본문의 내용을 검증한다.
