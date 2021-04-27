package com.example.demo.job;

import java.util.HashMap;
import java.util.Map;

import javax.sql.DataSource;

import com.example.demo.domain.pay.Pay;

import org.springframework.batch.core.Job;
import org.springframework.batch.core.Step;
import org.springframework.batch.core.configuration.annotation.JobBuilderFactory;
import org.springframework.batch.core.configuration.annotation.StepBuilderFactory;
import org.springframework.batch.item.ItemWriter;
import org.springframework.batch.item.database.JdbcPagingItemReader;
import org.springframework.batch.item.database.Order;
import org.springframework.batch.item.database.PagingQueryProvider;
import org.springframework.batch.item.database.builder.JdbcPagingItemReaderBuilder;
import org.springframework.batch.item.database.support.SqlPagingQueryProviderFactoryBean;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.jdbc.core.BeanPropertyRowMapper;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;


@Slf4j
@RequiredArgsConstructor
@Configuration
public class JdbcPagingItemReaderJobConfiguration {
  private final JobBuilderFactory jobBuilderFactory;
  private final StepBuilderFactory stepBuilderFactory;
  private final DataSource dataSource;

  private static final int chunkSize = 10;

  @Bean
  public Job jdbcPagingItemReaderJob() throws Exception {
    return jobBuilderFactory.get("jdbcPagingItemReaderJob")
            .start(jdbcPagingItemReaderStep())
            .build();
  }

  @Bean
  public Step jdbcPagingItemReaderStep() throws Exception {
    return stepBuilderFactory.get("jdbcPagingItemReaderStep")
            .<Pay, Pay>chunk(chunkSize)
            .reader(jdbcPagingItemReader())
            .writer(jdbcPagingItemWriter())
            .build();
  }

  @Bean
  public JdbcPagingItemReader<Pay> jdbcPagingItemReader() throws Exception {
    Map<String, Object> parameterValues = new HashMap<>();
    parameterValues.put("amount", 2000);

    return new JdbcPagingItemReaderBuilder<Pay>()
                .pageSize(chunkSize)
                .fetchSize(chunkSize)
                .dataSource(dataSource)
                .rowMapper(new BeanPropertyRowMapper<>(Pay.class))
                .queryProvider(createQueryProvider())
                // 쿼리에 대한 매개 변수 값의 Map을 지정한다.
                // where절에 선언된 파라미터 변수명과 일치해야한다.                
                .parameterValues(parameterValues)
                .name("jdbcPagingItemReader")
                .build();
  }

  private ItemWriter<Pay> jdbcPagingItemWriter() {
    return list -> {
      for (Pay pay: list) {
        log.info("Current Pay={}", pay);
      }
    };
  }

  /*
  JdcbCursorItemReader를 사용할 때는 단순 String으로 쿼리를 생성했지만
  PagingItemReader에서는 PagingQueryProvider를 통해 쿼리를 생성했다.

  그 이유는 각 Database에서 Paging을 지원하는 자체 전략이 존재하기 때문이다.
  이러한 이유로 Spring Batch에는 각 DB 의 Paging전략에 맞춰 구현되어야 하는데,
  DB마다 Provider코드를 바꿔야하니 불편함이 많다.

  그래서 Spring Batch는 SqlPagingQueryProviderFactoryBean을 통해 Datasource 설정값을 보고 
  Provider를 자동으로 선택한다.
  */


  @Bean
  public PagingQueryProvider createQueryProvider() throws Exception {
    SqlPagingQueryProviderFactoryBean queryProvider = new SqlPagingQueryProviderFactoryBean();
    queryProvider.setDataSource(dataSource);
    queryProvider.setSelectClause("id, amount, tx_name, tx_date_time");
    queryProvider.setFromClause("from pay");
    queryProvider.setWhereClause("where amount >= :amount");

    Map<String, Order> sortKeys = new HashMap<>(1);
    sortKeys.put("id", Order.ASCENDING);

    queryProvider.setSortKeys(sortKeys);

    return queryProvider.getObject();
  }

}
