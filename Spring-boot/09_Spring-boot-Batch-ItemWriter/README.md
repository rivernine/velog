# Spring-boot Batch ItemWriter
## 🎁 목차
- [Spring-boot Batch ItemWriter](#spring-boot-batch-itemwriter)
  - [🎁 목차](#-목차)
  - [0. 개요](#0-개요)
  - [1. Database Writer](#1-database-writer)
  - [2. JdbcBatchItemWriter](#2-jdbcbatchitemwriter)
    - [2.1. Create JdbcBatchItemWriter](#21-create-jdbcbatchitemwriter)
    - [2.2 Create pay2 table](#22-create-pay2-table)
    - [2.3. Execute](#23-execute)
    - [2.4. Check](#24-check)
  - [3. JpaItemWriter](#3-jpaitemwriter)
    - [3.1. Create JpaItemWriter](#31-create-jpaitemwriter)
    - [3.2. Execute](#32-execute)
    - [3.3. Check](#33-check)
  - [4. Custom ItemWriter](#4-custom-itemwriter)
    - [4.1. Create CustomItemWriter](#41-create-customitemwriter)
    - [4.2. Execute](#42-execute)
    - [4.3. Check](#43-check)

## 0. 개요
**ItemWriter**는 출력 기능이다.
초창기 Spring Batch는 item을 하나씩 다루었지만, 현재는 chunk 단위로 묶인 item List를 다룬다.
Reader의 `read()`는 Item을 하나 반환하는 반면, Writer의 `write()`는 인자로 Item List를 받는다.
**즉, Reader와 Processor를 거쳐 처리된 Item을 Chunk단위 만큼 쌓은 뒤 이를 Writer에게 전달한다.**

## 1. Database Writer
Java에서는 JDBC또는 ORM을 사용하여 RDBMS에 접근한다.
Spring Batch는 JDBC와 ORM 모두 Writer를 제공한다.
**Writer는 Chunk단위의 마지막 단계이며 항상 마지막에 `Flush`를 해줘야 한다.**
Writer가 받은 모든 Item이 처리된 후, Spring Batch는 현재 트랜잭션을 커밋한다.

Database Writer의 종류는 다음과 같다. 다음 중 **bold**표시 된 항목을 알아보겠다.
  - **JdbcBatchItemWriter**
  - HibernateItemWriter
  - **JpaItemWriter**

## 2. JdbcBatchItemWriter
JdbcBatchItemWriter는 다음과 같이 동작한다.
1. ChunkSize만큼 Query 모으기
2. 모아놓은 Query 한번에 전송
3. 받은 쿼리들 Database에서 실행

### 2.1. Create JdbcBatchItemWriter
- `JdbcBatchItemWriterJobConfiguration.java`
```java
@Slf4j
@RequiredArgsConstructor
@Configuration
public class JdbcBatchItemWriterJobConfiguartion {
  private final JobBuilderFactory jobBuilderFactory;
  private final StepBuilderFactory stepBuilderFactory;
  private final DataSource dataSource;

  private static final int chunkSize = 10;

  @Bean
  public Job jdbcBatchItemWriterJob() {
    return jobBuilderFactory.get("jdbcBatchItemWriterJob")
            .start(jdbcBatchItemWriterStep())
            .build();
  }

  @Bean
  public Step jdbcBatchItemWriterStep() {
    return stepBuilderFactory.get("jdbcBatchItemWriterStep")
            .<Pay, Pay>chunk(chunkSize)
            .reader(jdbcBatchItemWriterReader())
            .writer(jdbcBatchItemWriter())
            .build();
  }

  @Bean
  public JdbcCursorItemReader<Pay> jdbcBatchItemWriterReader() {
    return new JdbcCursorItemReaderBuilder<Pay>()
                .fetchSize(chunkSize)
                .dataSource(dataSource)
                .rowMapper(new BeanPropertyRowMapper<>(Pay.class))
                .sql("SELECT id, amount, tx_name, tx_date_time FROM pay")
                .name("jdbcBatchItemWriterReader")
                .build();
  }

  // beanMapped()를 사용할 떄는 필수
  @Bean
  public JdbcBatchItemWriter<Pay> jdbcBatchItemWriter() {
    // ColumnMapped()
    // return new JdbcBatchItemWriterBuilder<Map<String, Object>>()
    //             .dataSource(dataSource)
    //             .sql("insert into pay2(amount, tx_name, tx_date_time) values (:amount, :txName, :txDateTime)")
    //             .columnMapped()
    //             .build();

    // BeanMapped()
    return new JdbcBatchItemWriterBuilder<Pay>()
                .dataSource(dataSource)
                .sql("insert into pay2(amount, tx_name, tx_date_time) values (:amount, :txName, :txDateTime)")
                .beanMapped()
                .build();
  }
}
```
- `JdbcBatchItemWriter`
  - reader에서 넘어온 데이터를 하나씩 출력하는 wrtier
- `JdbcBatchItemWriterBuilder`
  - `columnMapped` 설정 : <Key, Value> 기반의 insert SQL Values 매핑
    - ex) `JdbcBatchItemWriterBuilder<Map<String, Object>>()`
  - `beanMapped` 설정 : Pojo 기반의 insert SQL Values 매핑
    - ex) `JdbcBatchItemWriterBuilder<Pay>()`

### 2.2 Create pay2 table
ItemWriter를 활용하여 `pay2`라는 테이블에 데이터를 삽입할 것이다.
mysql에 접속하여 `pay2` 테이블을 만들어준다.
```mysql
create table pay2 (
  id         bigint not null auto_increment,
  amount     bigint,
  tx_name     varchar(255),
  tx_date_time datetime,
  primary key (id)
) engine = InnoDB;
```

### 2.3. Execute
```sh
./gradlew build -x test

java -jar ./build/libs/*.jar --job.name=jdbcBatchItemWriterJob
```

### 2.4. Check
![](./1.png)

`pay2`테이블을 확인해보면 데이터가 들어간 것을 확인할 수 있다.

## 3. JpaItemWriter
ORM을 사용할 수 있는 `JpaItemWriter`이다.
Writer에 전달하는 데이터가 Entity 클래스라면 `JpaItemWriter`를 사용하면 된다.

### 3.1. Create JpaItemWriter
`JpaItemWriter`는 넘어온 Entity를 Database에 반영한다.
즉, `JpaItemWriter`는 Entity 클래스를 제네릭 타입으로 받아야한다.

- `JpaItemWriterJobConfiguration.java`
```java
@Slf4j
@RequiredArgsConstructor
@Configuration
public class JpaItemWriterJobConfiguration {
  private final JobBuilderFactory jobBuilderFactory;
  private final StepBuilderFactory stepBuilderFactory;
  private final EntityManagerFactory entityManagerFactory;

  private static final int chunkSize = 10;

  @Bean
  public Job jpaItemWriterJob() {
    return jobBuilderFactory.get("jpaItemWriterJob")
            .start(jpaItemWriterStep())
            .build();
  }

  @Bean
  public Step jpaItemWriterStep() {
    return stepBuilderFactory.get("jpbItemWriterStep")
            .<Pay, Pay2>chunk(chunkSize)
            .reader(jpaItemWriterReader())
            .processor(jpaItemProcessor())
            .writer(jpaItemWriter())
            .build();
  }

  @Bean
  public JpaPagingItemReader<Pay> jpaItemWriterReader() {
    return new JpaPagingItemReaderBuilder<Pay>()
                .name("jpaItemWriterReader")
                .entityManagerFactory(entityManagerFactory)
                .pageSize(chunkSize)
                .queryString("SELECT p FROM Pay p")
                .build();
  }

  @Bean
  public ItemProcessor<Pay, Pay2> jpaItemProcessor() {
    return pay -> new Pay2(pay.getAmount(), pay.getTxName(), pay.getTxDateTime());
  }

  @Bean
  public JpaItemWriter<Pay2> jpaItemWriter() {
    JpaItemWriter<Pay2> jpaItemWriter = new JpaItemWriter<>();
    jpaItemWriter.setEntityManagerFactory(entityManagerFactory);

    return jpaItemWriter;
  }
}
```

- `Pay2.java`
```java
@ToString
@Getter
@Setter
@NoArgsConstructor
@Entity
public class Pay2 {
    private static final DateTimeFormatter FORMATTER = DateTimeFormatter.ofPattern("yyyy-MM-dd hh:mm:ss");

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;
    private Long amount;
    private String txName;
    private LocalDateTime txDateTime;

    public Pay2(Long amount, String txName, String txDateTime) {
        this.amount = amount;
        this.txName = txName;
        this.txDateTime = LocalDateTime.parse(txDateTime, FORMATTER);
    }

    public Pay2(Long amount, String txName, LocalDateTime txDateTime) {
        this.amount = amount;
        this.txName = txName;
        this.txDateTime = txDateTime;
    }

    public Pay2(Long id, Long amount, String txName, String txDateTime) {
        this.id = id;
        this.amount = amount;
        this.txName = txName;
        this.txDateTime = LocalDateTime.parse(txDateTime, FORMATTER);
    }
}
```

- `Pay2Repository.java`
```java
public interface Pay2Repository extends JpaRepository<Pay2, Long> { }
```

### 3.2. Execute
```sh
./gradlew build -x test

java -jar ./build/libs/*.jar --job.name=jpaItemWriterJob
```

### 3.3. Check
![](./2.png)

`pay2`테이블에 추가로 데이터가 들어간 것을 확인할 수 있다.

## 4. Custom ItemWriter
Writer를 Custom하게 구현해야 할 일은 빈번하다.
예를 들어 다음과 같은 경우가 있다.
  - Reader에서 읽어온 데이터를 RestTemplate으로 외부 API에 전달할 경우
  - Singleton 객체에 값을 넣을 경우
  - 여러 Entity를 save할 경우

이러한 경우 `ItemWriter` 인터페이스를 구현하면 된다.
`System.out.println`의 역할을 하는 Writer를 만들어보자.
### 4.1. Create CustomItemWriter
- `CustomItemWriterJobConfiguration.java` 
```java
@Slf4j
@RequiredArgsConstructor
@Configuration
public class CustomItemWriterJobConfiguration {
  private final JobBuilderFactory jobBuilderFactory;
  private final StepBuilderFactory stepBuilderFactory;
  private final EntityManagerFactory entityManagerFactory;

  private static final int chunkSize = 10;

  @Bean
  public Job customItemWriterJob() {
    return jobBuilderFactory.get("customItemWriterJob")
            .start(customItemWriterStep())
            .build();
  }

  @Bean
  public Step customItemWriterStep() {
    return stepBuilderFactory.get("customItemWriterStep")
            .<Pay, Pay2>chunk(chunkSize)
            .reader(customItemWriterReader())
            .processor(customItemWriterProcessor())
            .writer(customItemWriter())
            .build();
  }

  @Bean
  public JpaPagingItemReader<Pay> customItemWriterReader() {
    return new JpaPagingItemReaderBuilder<Pay>()
                .name("customeItemWriterReader")
                .entityManagerFactory(entityManagerFactory)
                .pageSize(chunkSize)
                .queryString("SELECT p FROM Pay p")
                .build();
  }

  @Bean
  public ItemProcessor<Pay, Pay2> customItemWriterProcessor() {
    return pay -> new Pay2(pay.getAmount(), pay.getTxName(), pay.getTxDateTime());
  }

  @Bean
  public ItemWriter<Pay2> customItemWriter() {
    // Java8 이상
    return items -> {
      for (Pay2 item : items) {
        System.out.println(item);
      }
    };

    // Java7 이하
    // return new ItemWriter<Pay2>() {
    //   // 다음과 같이 write()를 override로 구현한다.
    //   @Override
    //   public void write(List<? extends Pay2> items) throws Exception {
    //     for (Pay2 item : items) {
    //       System.out.println(item);
    //     }
    //   }
    // };
  }
}
```

### 4.2. Execute
```sh
./gradlew build -x test

java -jar .\build\libs\demo-0.0.1-SNAPSHOT.jar --job.name=customItemWriterJob
```
### 4.3. Check
![](./3.png)

`pay` 테이블의 데이터가 `pay2`로 처리되어 출력되었다.

---
**모든 소스는 [깃허브](https://github.com/rivernine/velog/tree/master/Spring-boot)에 올려놓았다.**
**참고링크: [jojoldu 블로그](https://jojoldu.tistory.com/)**