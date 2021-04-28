# Spring-boot Batch ItemProcessor
## 🎁 Contents
- [Spring-boot Batch ItemProcessor](#spring-boot-batch-itemprocessor)
  - [🎁 Contents](#-contents)
  - [0. Summary](#0-summary)
  - [1. ItemProcessor](#1-itemprocessor)
  - [2. ItemProcessor Transformation](#2-itemprocessor-transformation)
    - [2.1. Create convert processor](#21-create-convert-processor)
    - [2.2. Execute](#22-execute)
    - [2.3. Check](#23-check)
  - [3. ItemProcessor Filter](#3-itemprocessor-filter)
    - [3.1. Create filter processor](#31-create-filter-processor)
    - [3.2. Execute](#32-execute)
    - [3.3. Check](#33-check)
  - [4. ItemProcessor chaining](#4-itemprocessor-chaining)
    - [4.1. Create Composite Processor](#41-create-composite-processor)
    - [4.2. Execute](#42-execute)
    - [4.3. Check](#43-check)

## 0. Summary
**ItemProcessor**는 데이터를 가공하거나 필터링하는 역할이다.
**ItemWriter**에서 충분히 구현 가능하고 따라서 Processor는 필수가 아니다.
하지만 읽기/처리/쓰기를 분리할 수 있어 사용을 권장한다.

## 1. ItemProcessor
**ItemReader**에서 넘겨준 데이터 **개별**건을 가공/처리한다.
데이터를 원하는 타입으로 변환하거나 원하는 데이터를 필터링하여 전달할 수도 있다.

`ItemProcessor`는 다음과 같이 구성되어 있다.
```java
public interface ItemProcessor<I, O> {
  O process(I item) throws Exception;
}
```
- `I`
  - ItemReader에서 받을 데이터 타입
- `O`
  - ItemWriter에게 보낼 데이터 타입     

`ItemReader`가 읽은 데이터를 `ItemProcessor`의 `process()`를 통과하여 `ItemWriter`에게 전달된다.
코드의 양이 많아지면 별도의 클래스로 분리해서 쓰기도 하지만 보통은 익명함수를 사용한다.

## 2. ItemProcessor Transformation
`ItemReader`로 읽어온 데이터의 타입을 변환시켜 `ItemWriter`에 전달하는 예제이다.
### 2.1. Create convert processor
- `ProcessorConvertJobConfiguration.java`
```java
@Slf4j
@RequiredArgsConstructor
@Configuration
public class ProcessorConvertJobConfiguration {
  public static final String JOB_NAME = "processorConvertBatch";
  public static final String BEAN_PREFIX = JOB_NAME + "_";

  private final JobBuilderFactory jobBuilderFactory;
  private final StepBuilderFactory stepBuilderFactory;
  private final EntityManagerFactory entityManagerFactory;  

  @Value("${chunkSize:1000}")
  private int chunkSize;

  @Bean(JOB_NAME)
  public Job job() {
    return jobBuilderFactory.get(JOB_NAME)
            .preventRestart()
            .start(step())
            .build();
  }

  @Bean(BEAN_PREFIX + "step")
  @JobScope
  public Step step() {
    return stepBuilderFactory.get(BEAN_PREFIX + "step")
            .<Pay, String>chunk(chunkSize)
            .reader(reader())
            .processor(processor())
            .writer(writer())
            .build();
  }

  @Bean
  public JpaPagingItemReader<Pay> reader() {
    return new JpaPagingItemReaderBuilder<Pay>()
                .name(BEAN_PREFIX+"reader")
                .entityManagerFactory(entityManagerFactory)
                .pageSize(chunkSize)
                .queryString("SELECT t FROM Pay t")
                .build();
  }

  @Bean
  public ItemProcessor<Pay, String> processor() {
    return pay -> {
      return pay.getTxName();
    };
  }

  private ItemWriter<String> writer() {
    return items -> {
      for (String item: items) {
        log.info("Pay TxName={}", item);
      }
    };
  }
}
```

### 2.2. Execute
```sh
./gradlew build -x test

java -jar ./build/libs/*.jar --job.name=processorConvertBatch
```

### 2.3. Check
![](./1.png)

`Pay`클래스가 `ItemProcessor`를 통해 String으로 잘 변환된 것을 확인할 수 있다.

## 3. ItemProcessor Filter
`ItemReader`로 읽어온 데이터 중 필터링 된 데이터만 `ItemWriter`에게 전달하는 예제이다.
### 3.1. Create filter processor
- `ProcessorConvertJobConfiguration.java`
```java
@Slf4j
@RequiredArgsConstructor
@Configuration
public class ProcessorNullJobConfiguration {
  
  public static final String JOB_NAME = "processorNullBatch";
  public static final String BEAN_PREFIX = JOB_NAME + "_";

  private final JobBuilderFactory jobBuilderFactory;
  private final StepBuilderFactory stepBuilderFactory;
  private final EntityManagerFactory emf;

  @Value("${chunkSize:1000}")
  private int chunkSize;

  @Bean(JOB_NAME)
  public Job job() {
    return jobBuilderFactory.get(JOB_NAME)
            .preventRestart()
            .start(step())
            .build();
  }

  @Bean(BEAN_PREFIX + "step")
  @JobScope
  public Step step() {
    return stepBuilderFactory.get(BEAN_PREFIX + "step")
            .<Pay, Pay>chunk(chunkSize)
            .reader(reader())
            .processor(processor())
            .writer(writer())
            .build();
  }

  @Bean(BEAN_PREFIX + "reader")
  public JpaPagingItemReader<Pay> reader() {
    return new JpaPagingItemReaderBuilder<Pay>()
            .name(BEAN_PREFIX+"reader")
            .entityManagerFactory(emf)
            .pageSize(chunkSize)
            .queryString("SELECT t FROM Pay t")
            .build();
  }

  @Bean(BEAN_PREFIX + "processor")
  public ItemProcessor<Pay, Pay> processor() {
    return pay -> {

      boolean isIgnoreTarget = pay.getAmount() > 2000L;
      if(isIgnoreTarget){
        log.info(">>>>>>>>> Pay txName={}, isIgnoreTarget={}", pay.getTxName(), isIgnoreTarget);
        return null;
      }

      return pay;
    };
  }

  private ItemWriter<Pay> writer() {
    return items -> {
      for (Pay item : items) {
        log.info("pay txName={}", item.getTxName());
      }
    };
  }
}
```

### 3.2. Execute
```sh
./gradlew build -x test

java -jar ./build/libs/*.jar --job.name=processorNullBatch
```

### 3.3. Check
![](./2.png)

`Pay` 테이블의 row 중 amount가 3000이상인 것을 제외한 나머지가 필터링되어졌다.

## 4. ItemProcessor chaining
`ItemProcessor`가 여러 기능을 포함할 경우를 생각해보자.
하나의 `ItemProcessor` 역할이 점점 커지게 될 것이다.

**이를 위해 `CompositeItemProcessor` 구현체가 존재한다.**
이는 `ItemProcessor`간의 체이닝을 지원한다.

### 4.1. Create Composite Processor
- `ProcessorCompositeJobConfiguration.java` 
```java
@Slf4j
@RequiredArgsConstructor
@Configuration
public class ProcessorCompositeJobConfiguration {

    public static final String JOB_NAME = "processorCompositeBatch";
    public static final String BEAN_PREFIX = JOB_NAME + "_";

    private final JobBuilderFactory jobBuilderFactory;
    private final StepBuilderFactory stepBuilderFactory;
    private final EntityManagerFactory emf;

    @Value("${chunkSize:1000}")
    private int chunkSize;

    @Bean(JOB_NAME)
    public Job job() {
        return jobBuilderFactory.get(JOB_NAME)
                .preventRestart()
                .start(step())
                .build();
    }

    @Bean(BEAN_PREFIX + "step")
    @JobScope
    public Step step() {
        return stepBuilderFactory.get(BEAN_PREFIX + "step")
                .<Pay, String>chunk(chunkSize)
                .reader(reader())
                .processor(compositeProcessor())
                .writer(writer())
                .build();
    }

    @Bean(BEAN_PREFIX + "reader")    
    public JpaPagingItemReader<Pay> reader() {
        return new JpaPagingItemReaderBuilder<Pay>()
                .name(BEAN_PREFIX+"reader")
                .entityManagerFactory(emf)
                .pageSize(chunkSize)
                .queryString("SELECT t FROM Pay t")
                .build();
    }

    @Bean(BEAN_PREFIX + "processor")
    public CompositeItemProcessor compositeProcessor() {
        List<ItemProcessor> delegates = new ArrayList<>(2);
        delegates.add(processor1());
        delegates.add(processor2());

        CompositeItemProcessor processor = new CompositeItemProcessor<>();

        processor.setDelegates(delegates);

        return processor;
    }

    public ItemProcessor<Pay, String> processor1() {
        return Pay::getTxName;
    }

    public ItemProcessor<String, String> processor2() {
        return name -> "트랜잭션 이름은"+ name + "입니다.";
    }

    private ItemWriter<String> writer() {
        return items -> {
            for (String item : items) {
                log.info("Pay Name={}", item);
            }
        };
    }
```

### 4.2. Execute
```sh
./gradlew build -x test

java -jar .\build\libs\demo-0.0.1-SNAPSHOT.jar --job.name=processorCompositeBatch
```
### 4.3. Check
![](./3.png)

`Pay`에서 String(`txName`)으로 변환되고, String이 또다른 String으로 변환된 것을 볼 수 있다.

---
**모든 소스는 [깃허브](https://github.com/rivernine/velog/tree/master/Spring-boot)에 올려놓았다.**
**참고링크: [jojoldu 블로그](https://jojoldu.tistory.com/)**