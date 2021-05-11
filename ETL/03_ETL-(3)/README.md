# ETL (3)

## 🎁 Contents
- [ETL (3)](#etl-3)
  - [🎁 Contents](#-contents)
  - [0. Summary](#0-summary)
  - [1. Using Job Parameter](#1-using-job-parameter)
  - [2. Execute](#2-execute)
  - [3. Using Scheduler](#3-using-scheduler)
  - [4. Check](#4-check)

## 0. Summary
앞에서 [**ETL** 기본 설정](https://velog.io/@rivernine/ETL-1)과 [**Spring batch Job**](https://velog.io/@rivernine/ETL-2)을 알아보았다.

**Scheduler**를 통해 Job을 주기적으로 실행시킬 것이다.
보다 자세한 Scheduler정보는 [여기](https://velog.io/@rivernine/Spring-boot-Scheduler)에 포스팅해놓았다.

## 1. Using Job Parameter
Spring batch에서 특정 Job을 실행시키기 위해서는 **Job Parameter**를 설정해야한다.
**Job Parameter**는 `@JobScope`나 `@StepScope`와 함께 사용한다.
`@JobScope`: Step과 함께 사용한다.
`@StepScope`: tasklet이나 ItemReader, ItemProcessor, ItemWriter와 함께 사용한다.

다음 예제는 Job Parameter로 `requestDate`를 받아 `ItemProcessor`에서 출력하는 예제이다.

```java
@Bean
  @StepScope
  public ItemProcessor<Product, TransProduct> processor(@Value("#{jobParameters[requestDate]}") String requestDate) {
    return product -> {
      String name = product.getName();
      Long price = product.getPrice();
      LocalDateTime created = product.getCreated();
      System.out.println(requestDate);
      if( price > 2500 ) {
        return new TransProduct(name, price - 500L, created, true);
      } else {
        return new TransProduct(name, price, created, false);
      }
    };
  }
```

## 2. Execute
`etlJob`을 실행하고 Job Parameter인 `requestDate`에 값을 할당해준다.
```sh
./gradlew build -x test

java -jar ./build/libs/*.jar --job.name=etlJob requestDate=20210511
```

## 3. Using Scheduler
이제 [2. Execute](#2-execute)에서 만든 `jar`를 주기적으로 실행시켜주자.
본 문서에서는 Jenkins를 이용하여 Scheduling을 할 것이다.
[이 곳](https://velog.io/@rivernine/Spring-boot-Scheduler#3-jenkins)에 Jenkins 셋팅을 명시해 놓았다.

여기서 `jar`를 실행하는 부분에 Job Parameter를 같이 넘겨주면 작업완료이 완료된다.

```sh
# requestDate로 현재 시간을 넘겨준다.
java -jar $PWD/demo-0.0.1-SNAPSHOT.jar --job.name=etlJob requestDate=$(date | tr -d " ")
```

## 4. Check
`Build History`에서 1분마다 Batch가 실행되는 것을 확인할 수 있다.
![](./1.png)

---
**모든 소스는 [Github](https://github.com/rivernine/velog/tree/master/Spring-boot)에 올려놓았다.**