# Spring-boot-Batch-Multiple-Thread

## 🎁 Contents
- [Spring-boot-Batch-Multiple-Thread](#spring-boot-batch-multiple-thread)
  - [🎁 Contents](#-contents)
  - [0. Summary](#0-summary)

## 0. Summary
Spring batch를 사용하여 ETL을 돌리던 중, 10,000건의 데이터처리에 약 1분정도의 시간이 소요된다는 것을 발견하였다.
`uptime`, `nmon`등을 통해 리소스들을 확인해본 결과 놀고있는 자원들이 꽤나 많았다.
타 서비스에 영향을 덜 줄 것이니 안정성 측면에서는 기특한 녀석이지만.. 
batch 전용 서버에서라면 얘기가 다르다.

이러한 이유로 Spring batch를 멀티스레드로 돌리는 방법을 기술하고자 한다.

```java
public class FilterJobConfiguration {

  private static final String JOB_NAME = "filterJob";  

  private final JobBuilderFactory jobBuilderFactory;
  private final StepBuilderFactory stepBuilderFactory;

  @Autowired 
  @Qualifier("dataSourceStaging")
  private DataSource dataSourceStaging;

  @Autowired
  @Qualifier("dataSourceAnalysis")
  private DataSource dataSourceAnalysis;

  @Value("${chunkSize:1000}")
  private int chunkSize;

  @Value("${poolSize:10}")
  private int poolSize;

  @Bean(name = JOB_NAME+"taskPool")
  public TaskExecutor executor() {
      ThreadPoolTaskExecutor executor = new ThreadPoolTaskExecutor(); 
      executor.setCorePoolSize(poolSize);
      executor.setMaxPoolSize(poolSize);
      executor.setThreadNamePrefix("multi-thread-");
      executor.setWaitForTasksToCompleteOnShutdown(Boolean.TRUE);
      executor.initialize();
      return executor;
  }

  @Bean(JOB_NAME)
  public Job job() throws Exception {
    return jobBuilderFactory.get(JOB_NAME)
            .preventRestart()
            .start(step())
            .build();
  }

  @Bean(name = JOB_NAME +"_step")
  public Step step() throws Exception {
      return stepBuilderFactory.get(JOB_NAME +"_step")
              .<Purchase, PurchaseFiltered>chunk(chunkSize)
              .reader(reader())
              .processor(processor())
              .writer(writer())
              .taskExecutor(executor())
              .throttleLimit(poolSize)
              .build();
  }

  @Bean(name = JOB_NAME + "_reader")
  public JdbcPagingItemReader<Purchase> reader() throws Exception {
      return new JdbcPagingItemReaderBuilder<Purchase>()
              .pageSize(chunkSize)
              .fetchSize(chunkSize)
              .dataSource(dataSourceStaging)
              .rowMapper(new BeanPropertyRowMapper<>(Purchase.class))
              .queryProvider(createQueryProvider())
              .name("jdbcPagingItemReader")
              .saveState(false)
              .build();
  }

  @Bean
  public PagingQueryProvider createQueryProvider() throws Exception {
      SqlPagingQueryProviderFactoryBean queryProvider = new SqlPagingQueryProviderFactoryBean();
      queryProvider.setDataSource(dataSourceStaging);
      queryProvider.setSelectClause("id, time, product_id, category_id, category_code, brand, price, user_id");
      queryProvider.setFromClause("from orders");

      Map<String, Order> sortKeys = new HashMap<>(1);
      sortKeys.put("id", Order.ASCENDING);

      queryProvider.setSortKeys(sortKeys);

      return queryProvider.getObject();
  }

  @Bean(name = JOB_NAME + "_processor")
  public ItemProcessor<Purchase, PurchaseFiltered> processor() {
    return purchase -> {
      String time = purchase.getTime();
      String product_id = purchase.getProduct_id();
      Long category_id = purchase.getCategory_id();
      String category_code = purchase.getCategory_code();
      String brand = purchase.getBrand();
      Long price = purchase.getPrice();
      String user_id = purchase.getUser_id();
      String seller_id = Integer.toString((int) (Math.random() * 30000));

      if(purchase.getId() % 10000 == 0) 
        log.info("Current Purchase={}", purchase);
      return new PurchaseFiltered(time, product_id, category_id, category_code, brand, price, user_id, seller_id);
    };
  }

  @Bean(name = JOB_NAME + "_writer")
  public JdbcBatchItemWriter<PurchaseFiltered> Writer() {
    return new JdbcBatchItemWriterBuilder<PurchaseFiltered>()
              .dataSource(dataSourceAnalysis)
              // .sql("INSERT INTO filtered_orders(time, product_id, category_id, category_code, brand, price, user_id, seller_id) values (:time, :product_id, :category_id, :category_code, :brand, :price, :user_id, :seller_id)")
              .sql("INSERT INTO filtered_purchases(time, product_id, category_id, category_code, brand, price, user_id, seller_id) values (:time, :product_id, :category_id, :category_code, :brand, :price, :user_id, :seller_id)")
              .beanMapped()
              .build();
  }
}
```
---
**모든 소스는 [Github](https://github.com/rivernine/velog/)에 올려놓았다.**