# Spring-boot framework

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

- `@Bean` vs. `@Component`
  - `@Bean`
    - 직접 제어가 불가능한 외부 라이브러리 또는 설정을 위한 클래스 등록
    - Method level에서 적용
  - `@Component`
    - 직접 개발한 클래스 등록
    - Class level에서 적용

## IoC / DI - Bean
component, bean을 context영역에두어 springboot framework가 관리하게 해준다.
IoC(제어의 역전: springboot framework이 제어를 할 수 있음)

## single tone
spring-boot에서는 application context에서 bean을 singletone형태로 관리 (default)

## annotationProcessor
컴파일러 단계에서 유저가 정의한 어노테이션의 소스코드를 분석하고 처리하기 위해 사용되는 훅이다.

# Test
## Junit 5
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

## MockMvc
Mock: 모조품
테스트에 필요로하는 기능만으로 가짜 객체를 만들어 mvc동작을 하게 하는 클래스

## AssertThat
테스트 중 두 값을 비교하는데에 사용
메소드 체이닝이 지원되어 `isEqualTo()`와 같이 사용할 수 있음
`JUnit` 지원 메소드와 `assertj` 둘 중 하나를 선택 사용 

## Bean Scope
스프링에서 Bean을 생성할 때, 모든 Bean이 싱글톤으로 생성된다.
어디에서든지 Bean을 주입받는다면 동일한 Bean을 주입받는 것을 보장한다.
그러나 Bean 생성시, Scope를 prototype으로 주면 Bean 주입마다 새로운 인스턴스가 생성된다.

## @Component
singleton bean을 생성하는 어노테이션이다.
`@Scope("Prototype")`으로 singleton이 아닌 bean을 생성할 수도 있다.