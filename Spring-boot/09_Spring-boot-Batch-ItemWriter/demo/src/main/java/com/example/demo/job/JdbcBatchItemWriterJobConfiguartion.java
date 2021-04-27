package com.example.demo.job;

import javax.sql.DataSource;

import com.example.demo.domain.pay.Pay;

import org.springframework.batch.core.Job;
import org.springframework.batch.core.Step;
import org.springframework.batch.core.configuration.annotation.JobBuilderFactory;
import org.springframework.batch.core.configuration.annotation.StepBuilderFactory;
import org.springframework.batch.item.database.JdbcBatchItemWriter;
import org.springframework.batch.item.database.JdbcCursorItemReader;
import org.springframework.batch.item.database.builder.JdbcBatchItemWriterBuilder;
import org.springframework.batch.item.database.builder.JdbcCursorItemReaderBuilder;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.jdbc.core.BeanPropertyRowMapper;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;

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
  // reader에서 넘어온 데이터를 하나씩 출력하는 writer
  public JdbcBatchItemWriter<Pay> jdbcBatchItemWriter() {
    // JdbcBatchItemWriterBuilder의 설정값.
    //   columnMapped: <Key, Value> 기반의 insert SQL Values 매핑
    //   beanmapped  : Pojo 기반의 insert SQL Values 매핑

    // BeanMapped()
    return new JdbcBatchItemWriterBuilder<Pay>()
                .dataSource(dataSource)
                .sql("insert into pay2(amount, tx_name, tx_date_time) values (:amount, :txName, :txDateTime)")
                .beanMapped()
                .build();

    // // ColumnMapped()
    // return new JdbcBatchItemWriterBuilder<Map<String, Object>>()
    //             .dataSource(dataSource)
    //             .sql("insert into pay2(amount, tx_name, tx_date_time) values (:amount, :txName, :txDateTime)")
    //             .columnMapped()
    //             .build();
  }
}
