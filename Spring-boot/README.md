## IoC / DI - Bean
component, bean을 context영역에두어 springboot framework가 관리하게 해준다.
IoC(제어의 역전: springboot framework이 제어를 할 수 있음)

## single tone
 spring-boot에서는 application context에서 bean을 singletone형태로 관리 (default)

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
