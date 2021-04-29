# Spring-boot Scheduler
## 🎁 Contents
- [Spring-boot Scheduler](#spring-boot-scheduler)
  - [🎁 Contents](#-contents)
  - [0. Summary](#0-summary)
  - [1. Spring-boot Framework Scheduler](#1-spring-boot-framework-scheduler)
    - [1.1. Enable Scheduling](#11-enable-scheduling)
    - [1.2 Create Job](#12-create-job)
    - [1.3 Execute](#13-execute)
    - [1.4 Check](#14-check)
  
## 0. Summary
Linux crontab과 같은 scheduler를 Spring-boot에서 다뤄보자.
본 문서에서는 다음과 같은 job scheduler를 다룰 것이다.
- Spring-boot Framework Scheduler
- Quartz
- Jenkins

## 1. Spring-boot Framework Scheduler
Spring-boot 자체적으로 지원하는 Scheduler로 `@EnableScheduling, @Scheduled`만으로 간단하게 구현 가능하다.
**간단한 Job Scheduling을 할 때 사용하면 좋다.**
### 1.1. Enable Scheduling
Spring-boot 진입점에 `@EnableScheduling`을 선언한다.
- `DemoApplication.java`
```java
@EnableScheduling
@SpringBootApplication
public class DemoApplication {
  public static void main(String[] args) {
    SpringApplication.run(DemoApplication.class, args);
  }
}
```

### 1.2 Create Job
주기적으로 실행될 Job을 구현한다.
- `SpringFrameworkScheduler.java`
```java
@Component
public class SpringFrameworkScheduler {
  
  @Scheduled(fixedDelay = 1000)
  public void printJob() {
    System.out.println(new Date());
  }
}
```
- `@Scheduled(fixedDelay = 1000)`
  - 1000ms 주기로 메소드를 반복한다.
  - `fixedDelay`외에도 `fixedRate, initialDelay, cron`등 다양한 옵션을 사용할 수 있다.
- 다음은 자주 쓰이는 `cron`의 옵션이다.
  - `(cron = "초 분 시 일 월 요일")`
  - `*` : all
  - `?` : none
  - `m` : array
  - `a-b` : a부터 b까지
  - `a/b` : a부터 b마다. a, a+b, a+b+b, ...
### 1.3 Execute
```sh
./gradlew build -x test

java -jar ./build/libs/*.jar
```

### 1.4 Check
![](./1.PNG)

1000ms주기로 출력이 되는 것을 확인할 수 있다.






---
**모든 소스는 [깃허브](https://github.com/rivernine/velog/tree/master/Spring-boot)에 올려놓았다.**
