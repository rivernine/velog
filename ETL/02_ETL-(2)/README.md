# ETL (2)

## 🎁 Contents
- [ETL (2)](#etl-2)
  - [🎁 Contents](#-contents)
  - [0. Summary](#0-summary)
  - [1. Create Job](#1-create-job)
  - [2. Create Step](#2-create-step)
  - [3. Create `ItemReader`](#3-create-itemreader)
  - [4. Create `ItemProcessor`](#4-create-itemprocessor)
  - [5. Create `ItemWriter`](#5-create-itemwriter)
  - [6. Execute](#6-execute)
  - [7. Check](#7-check)

## 0. Summary
[이전 포스트](https://velog.io/@rivernine/ETL-1) 에서 **ETL**의 기본설정을 알아보았다.
이제 Spring batch의 Job을 생성하고 `ItemReader, ItemProcessor, ItemWriter`를 커스터마이징할 것이다.

> 보다 자세히 Spring batch를 알고싶으면 [관련 포스트](https://velog.io/@rivernine/Spring-boot-Batch)를 참고하시오

## 1. Create Job
먼저, Job을 생성한다.
**Job은 여러 개의 Step들로 구성되어있다.**

- `job/ETLJob.java`
```java
@Slf4j
@RequiredArgsConstructor
@Configuration
public class ETLJob {
  private static final String JOB_NAME = "etlJob";  

  private final JobBuilderFactory jobBuilderFactory;
  private final StepBuilderFactory stepBuilderFactory;

  @Qualifier("dataSource-dbsource")
  @Autowired
  private DataSource dataSourceDbSource;

  @Qualifier("dataSource-dbtarget")
  @Autowired
  private DataSource dataSourceDbTarget;

  @Value("${chunkSize:100}")
  private int chunkSize;

  @Bean(JOB_NAME)
  public Job job() {
    return jobBuilderFactory.get(JOB_NAME)
            .preventRestart()
            .start(step())
            .build();
  }

  @Bean(JOB_NAME + "_step")
  public Step step() {
  }

  @Bean 
  public JdbcCursorItemReader<Product> reader() {  
  }

  @Bean
  public ItemProcessor<Product, TransProduct> processor() {
  }

  @Bean
  public JdbcBatchItemWriter<TransProduct> writer() {
  }
}
```
- `preventRestart()`
  - 한 번 실행한 Job에 대해 재시작 방지
- `dataSourceDbSource`
  - `db-source` dataSource
- `dataSourceDbTarget`
  - `db-target` dataSource
- `chunkSize`
  - Database에서 읽어올 데이터의 크기. 
  - `ItemReader`가 데이터를 읽어들여 `ResultSet`에 저장한다.

## 2. Create Step
**Step은 여러 개의 tasklet으로 구성되어 있다.**
tasklet은 `ItemReader, ItemProcessor, ItemWriter`로 세분화된다.
```java
@Bean(JOB_NAME + "_step")
public Step step() {
  return stepBuilderFactory.get(JOB_NAME + "_step")            
          .<Product, TransProduct>chunk(chunkSize)
          .reader(reader())
          .processor(processor())
          .writer(writer())
          .build();
}
```
- `<Product, TransProduct>chunk(chunkSize)`
  - `<Product, >` : Reader에서 반환할 타입
  - `<, TransProduct>` : Writer에 넘어올 타입

## 3. Create `ItemReader`
Database에서 데이터를 가져올 `ItemReader`를 만들어보자.
다음 `ItemReader`는 **DB의 데이터를 Cursor방식으로 가져온다.**
> ETL에서 **E(Extraction)**의 과정이다.
```java
@Bean 
public JdbcCursorItemReader<Product> reader() {
  return new JdbcCursorItemReaderBuilder<Product>()
          .fetchSize(chunkSize)
          .dataSource(dataSourceDbSource)
          .rowMapper(new BeanPropertyRowMapper<>(Product.class))
          .sql("SELECT id, name, price, created FROM product")
          .name("JdbcCursorItemReader")
          .build();
}
```
- `dataSource(dataSourceDbSource)`
  - DB(`db-source`)에 접근하기 위해 사용할 datasource 객체 할당
- `rowMapper(new BeanPropertyRowMapper<>(Product.class))`
  - 쿼리 결과를 Java Instance로 매핑하기 위한 Mapper

## 4. Create `ItemProcessor`
`ItemProcessor`는 `ItemReader`에서 가져온 데이터를 변환/필터를 해주는 역할이다.
- `Product` -> `TransProduct`
  - `Product`의 가격이 2500보다 크면 discount를 해주는 `ItemProcessor`이다.
> ETL에서 **T(Transformation)**의 과정이다.
```java
@Bean
public ItemProcessor<Product, TransProduct> processor() {
  return product -> {
    String name = product.getName();
    Long price = product.getPrice();
    LocalDateTime created = product.getCreated();
    if( price > 2500 ) {
      return new TransProduct(name, price - 500L, created, true);
    } else {
      return new TransProduct(name, price, created, false);
    }
  };
}
```

## 5. Create `ItemWriter`
`ItemProcessor`를 거친 데이터를 다른 DB(`db-target`)에 저장한다.
**Datasource는 `db-target`의 datasource를 사용한다.**
> ETL에서 **L(Loading)**의 과정이다.
```java
@Bean
public JdbcBatchItemWriter<TransProduct> writer() {
  return new JdbcBatchItemWriterBuilder<TransProduct>()
              .dataSource(dataSourceDbTarget)
              .sql("INSERT INTO trans_product(name, price, created, discount) values (:name, :price, :created, :discount)")
              .beanMapped()
              .build();
}
```
- `dataSource(dataSourceDbTarget)`
  - `db-target`의 datasource 객체를 할당한다.
- `beanMapped()`
  - `JdbcBatchItemWriter`에서 POJO를 사용할 때 `@Bean`과 함께 사용한다.
  - POJO가 아닌 `Map<Key, Value>`를 사용하면 사용하지 않음.

## 6. Execute
**`--job.name`을 적어 spring batch가 실행할 job을 명시한다.**
해당 설정은 `application.yml`에 있다.

> 주의: Spring batch의 메타데이터 테이블에서는 성공한 job에 대해 중복실행 방지를 하고 있다.
> 다른말로 아래의 명령어로는 `etlJob`을 여러번 실행 할 수 없다는 말이다.
> 편법이지만 `java -jar *.jar --job.name=etlJob version=1`과 같이 아무 시스템파라미터를 넣어주면 중복실행이 가능하다.
```sh
./gradlew build -x test

java -jar ./build/libs/*.jar --job.name=etlJob
```

## 7. Check
```sh
docker exec -it db-target bash

mysql -u rivernine -p
# Enter password
```
```mysql
use etl;

select * from trans_product;
```

![](./1.png)

`db-target` etl database의 trans_product 테이블을 조회하면 다음과 같이 데이터가 삽입된 것을 볼 수 있다.

---
**모든 소스는 [Github](https://github.com/rivernine/velog/tree/master/Spring-boot)에 올려놓았다.**