# Spring-boot framework

## LocalDateTIme
Database의 date타입과 매핑하기위해 자주 사용하는 타입이다.


---

## Rest API

### Parameter passing in `Get` method
- PathVariable
```java
@GetMapping("/test/{value}")
public String getTest(@PathVariable("value") String value) {  
  return value;
}
```

- Request parameter
```java
@GetMapping("/hello/dto")
public String cryptoDto(@RequestParam("value") String value) {
  return value;
}
```

### Return to json
Json형식으로 return을 하고 싶을 때 사용한다.
```java
@GetMapping("/test")
public String getTest(@PathVariable("value") String value) {  
  JsonObject result = new JsonObject();    

  result.addProperty("title", "제목입니다.");
  result.addProperty("value", value);

  return result.toString();
}
```


---

## Json
Spring-boot 에서 사용하는 Json library 중 대표적으로 `jackson`과 `gson`이 있다.
그 중 `Gson`을 통해 Json을 핸들링한다.

### JsonString to JsonObject
`JsonParser`와 `Gson` 중 하나를 이용하여 parsing할 수 있다.
```java

@Test
public void convert_string_to_json() throws Exception {
  String jsonString = "{ \"name\": \"Jack\", \"java\": true }";
  // 방법 1
  JsonObject jsonObject = JsonParser.parseString(jsonString).getAsJsonObject();

  // 방법 2
  JsonObject jsonObject = new Gson().fromJson(jsonString, JsonObject.class);

  assertThat(jsonObject.get("name").getAsString()).isEqualTo("Jack");
}
```

### JsonArrayString to JsonObject
```java
@Test
public void convert_array_to_json() throws Exception {
  Gson gson = new Gson();
  String jsonString = "[{ \"name\": \"Jack\", \"java\": true }]";

  JsonObject[] jsonObjectArray = gson.fromJson(jsonString, JsonObject[].class);

  for( int i = 0; i < jsonObjectArray.length; i++ ){
    JsonObject jsonObject = jsonObjectArray[i];
    assertThat(jsonObject.get("name").getAsString()).isEqualTo("Jack");
  }
}
```


---

## Lombok
Lombok에서 제공하는 `@RequiredArgsConstructor` 어노테이션은 초기화 되지 않은 `final`필드, `@NotNull`이 붙은 필드에 대해 생성자를 생성해 준다.
DI 편의성을 위해 사용되곤 한다.

---

## Bean
스프링 IoC(Inversion of Control) 컨테이너에 의해 관리되고 애플리케이션의 핵심을 이루는 객체들을 Beans라고 부른다.
다시말해, IoC컨테이너에 의해 인스턴스화되어 관리되는 객체를 말한다.
이를 제외하고 Bean은 수많은 객체들 중 하나이다.

### Bean의 종류
`@Component, @Service, @Controller, @Repository, @Bean, @Configuration` 등이 있다.
필요한 Bean을 등록하고, 필요한 곳에서 `@Autowired`를 통해 주입받아 사용하는 것이 일반적이다.
`@Controller, @Service, @Repository`는 모두 `@Component`를 상속받고 있다.

### Bean 등록
- `@Bean`
`@Bean`을 사용하기 위해서는 **반드시 `@Bean`을 사용하는 클래스에 `@Configuration`을 명시**하여 Bean을 등록하고자 함을 명시해주어야 한다.
> `@Configuration`없이 `@Bean`만 사용해도 빈 등록이 된다. **다만 Singleton을 보장하지 못한다!!**

- `@Component`
직접 개발한 클래스**를 Bean으로 등록하고자 하는 경우 사용한다.
`@Scope("Prototype")`으로 singleton이 아닌 bean을 생성할 수도 있다.

- `@Bean` vs. `@Component`
  - `@Bean`
    - 직접 제어가 불가능한 외부 라이브러리 또는 설정을 위한 클래스 등록
    - Method level에서 적용
  - `@Component`
    - 직접 개발한 클래스 등록
    - Class level에서 적용

### `@Lazy`와 `@Primary`
- `@Lazy`
  - Bean을 등록할 때 상단에 `@Lazy`를 써주면 해당 Bean이 호출 될 때 Bean이 생성된다.
- `@Primary`
  - 동일 클래스로 다른 Bean을 등록할 경우 `@Primary`를 같이 사용한 Bean이 기본으로 등록된다.

### `@Autowired(required = false)` 
의존성을 **Optional**로 설정하는 것이다.
주입받을 의존객체가 필수적이지 않을 경우 `@Autowired(required = false)`로 설정해서 의존객체를 주입받지 못하더라도 빈을 생성하도록 할 수 있다.


---

## DI(Dependency Injection)
Spring Framework에서 의존성을 주입하는 방법은 3가지가 존재한다.
- 생성자 주입 (Constructor Injection)
- 필드 주입 (Field Injection)
- 수정자 주입 (Setter Injection)

### 필드 주입 (Field Injection)
```java
@Service
public class FieldServiceImpl implements FieldService {

  @Autowired
  private SampleService sampleService;

}
```

### 수정자 주입 (Setter Injection)
```java
@Service
public class SetterServiceImpl implements SetterService {

  private SampleService sampleService;

  @Autowired
  public void setSampleService(SampleService sampleService) {
    this.sampleService = sampleService;
  }

}
```

### 생성자 주입 (Constructor Injection)
생성자에 `@Autowired`를 붙여 주입한다.
단일 생성자의 경우 붙이지 않아도 된다.

```java
@Service
public class ConstructorServiceImpl implements ConstructorService {

  private final SampleService sampleService;

  @Autowired
  public ConstructorServiceImpl(SampleService sampleService) {
    this.sampleService = sampleService;
  }

}
```

### 생성자 주입의 장점
Spring-boot에서도 Constructor Injection을 권장한다.
그 배경엔 다음과 같은 장점이 있다.
- `NullPointerException` 방지
  - 의존관계에 대한 내용을 외부로 노출시킴으로써 **컴파일 오류**를 잡아낼 수 있다.
- 주입받을 필드를 `final`로 선언 가능
  - 즉, 런타임에 객체 불변성을 보장한다.
- 순환참조 방지
  > A->B, B->A와 같은 참조 관계의 경우 다른 DI는 문제없이 어플리케이션이 작동한다.
  > 그러나 실제 코드가 호출되면 에러를 뱉으며 작동이 중지된다.
  > Constructor Injection은 이를 사전방지해준다.
  >
  > Field & Setter Injection은 먼저 빈을 생성한 후 주입하려는 빈을 찾아 주입한다.
  > 그러나 **Constructor Injection은 주입하려는 빈을 먼저 찾기때문에(객체 생성 시점에 빈을 주입) 사전에 오류가 발생한다.**
- 테스트코드 작성 용이

## IoC / DI - Bean
component, bean을 context영역에두어 springboot framework가 관리하게 해준다.
IoC(제어의 역전: springboot framework이 제어를 할 수 있음)

## single tone
spring-boot에서는 application context에서 bean을 singletone형태로 관리 (default)

## annotationProcessor
컴파일러 단계에서 유저가 정의한 어노테이션의 소스코드를 분석하고 처리하기 위해 사용되는 훅이다.

---

## Test
### Junit 5
`org.springframework.boot:spring-boot-starter-test`는 junit4에 의존성을 가지고 있다.
junit5를 사용하기 위해서는 이를 제외시키고 따로 추가하여야 한다.
```groovy
dependencies {
    testImplementation('org.springframework.boot:spring-boot-starter-test') {
        exclude module: 'junit'
    }
    testImplementation('org.junit.jupiter:junit-jupiter-api:5.2.0')
    testCompile('org.junit.jupiter:junit-jupiter-params:5.2.0')
    testRuntime('org.junit.jupiter:junit-jupiter-engine:5.2.0')
}
```

### MockMvc
Mock: 모조품
테스트에 필요로하는 기능만으로 가짜 객체를 만들어 mvc동작을 하게 하는 클래스

### AssertThat
테스트 중 두 값을 비교하는데에 사용
메소드 체이닝이 지원되어 `isEqualTo()`와 같이 사용할 수 있음
`JUnit` 지원 메소드와 `assertj` 둘 중 하나를 선택 사용 

### Controller test


