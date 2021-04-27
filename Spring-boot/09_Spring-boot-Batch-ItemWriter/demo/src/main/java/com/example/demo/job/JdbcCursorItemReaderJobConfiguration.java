package com.example.demo.job;

import javax.sql.DataSource;

import com.example.demo.domain.pay.Pay;

import org.springframework.batch.core.Job;
import org.springframework.batch.core.Step;
import org.springframework.batch.core.configuration.annotation.JobBuilderFactory;
import org.springframework.batch.core.configuration.annotation.StepBuilderFactory;
import org.springframework.batch.item.ItemWriter;
import org.springframework.batch.item.database.JdbcCursorItemReader;
import org.springframework.batch.item.database.builder.JdbcCursorItemReaderBuilder;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.jdbc.core.BeanPropertyRowMapper;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;


// Processor는 필수가 아니기 때문에 Reader, Writer만 구현한다.
@Slf4j
@RequiredArgsConstructor
@Configuration
public class JdbcCursorItemReaderJobConfiguration {
  
  private final JobBuilderFactory jobBuilderFactory;
  private final StepBuilderFactory stepBuilderFactory;
  private final DataSource dataSource;

  private static final int chunkSize = 10;

  @Bean
  public Job jdbcCursorItemREaderJob() {
    return jobBuilderFactory.get("jdbcCursorItemReaderJob")
            .start(jdbcCursorItemReaderStep())
            .build();
  }

  @Bean 
  public Step jdbcCursorItemReaderStep() {
    return stepBuilderFactory.get("jdbcCursorItemReaderStep")
            // <Pay, > : Reader에서 반환할 타입
            // <, Pay> : Writer에 넘어올 타입
            // chunkSize: Chunk transaction 범위
            .<Pay, Pay>chunk(chunkSize)
            .reader(jdbcCursorItemReader())
            .writer(jdbcCursorItemWriter())
            .build();
  }

  // ItemReader의 가장 큰 장점은 데이터를 Streaming 할 수 있다는 것이다.
  @Bean 
  public JdbcCursorItemReader<Pay> jdbcCursorItemReader() {
    return new JdbcCursorItemReaderBuilder<Pay>()
            // DB에서 한번에 가져올 데이터 양
            // 데이터를 FetchSize만큼 가져와 `read()`를 통해 하나씩 가져온다.
            .fetchSize(chunkSize)
            // DB에 접근하기 위해 사용할 Datasource 객체를 할당
            .dataSource(dataSource)
            // 쿼리 결과를 Java 인스턴스로 매핑하기 위한 Mapper
            .rowMapper(new BeanPropertyRowMapper<>(Pay.class))
            // Reader로 사용할 쿼리문
            .sql("SELECT id, amount, tx_name, tx_date_time FROM pay")
            // Reader의 이름
            .name("jdbcCursorItemReader")
            .build();
  }

  private ItemWriter<Pay> jdbcCursorItemWriter() {
    return list -> {
      for (Pay pay: list){
        log.info("Current Pay={}", pay);
      }
    };
  }
}
