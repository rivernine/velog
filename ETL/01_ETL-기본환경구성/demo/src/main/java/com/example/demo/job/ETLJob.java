package com.example.demo.job;

import java.time.format.DateTimeFormatter;

import javax.sql.DataSource;

import com.example.demo.domain.product.Product;
import com.example.demo.domain.product.TransProduct;

import org.springframework.batch.core.Job;
import org.springframework.batch.core.Step;
import org.springframework.batch.core.configuration.annotation.JobBuilderFactory;
import org.springframework.batch.core.configuration.annotation.StepBuilderFactory;
import org.springframework.batch.item.ItemProcessor;
import org.springframework.batch.item.database.JdbcBatchItemWriter;
import org.springframework.batch.item.database.JdbcCursorItemReader;
import org.springframework.batch.item.database.builder.JdbcCursorItemReaderBuilder;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.jdbc.core.BeanPropertyRowMapper;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;

@Slf4j
@RequiredArgsConstructor
@Configuration
public class ETLJob {
  private static final String JOB_NAME = "etlJob";  

  private final JobBuilderFactory jobBuilderFactory;
  private final StepBuilderFactory stepBuilderFactory;
  private final DataSource dataSource;

  @Value("${chunkSize:1000}")
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
    return stepBuilderFactory.get(JOB_NAME + "_step")            
            .<Product, TransProduct>chunk(chunkSize)
            .reader(reader())
            .processor(processor())
            .writer(writer())
            .build();
  }

  @Bean 
  public JdbcCursorItemReader<Product> reader() {
    return new JdbcCursorItemReaderBuilder<Product>()
            .fetchSize(chunkSize)
            .dataSource(dataSource)
            .rowMapper(new BeanPropertyRowMapper<>(Product.class))
            .sql("SELECT id, name, price, created FROM product")
            .name("JdbcCursorItemReader")
            .build();
  }

  @Bean
  public ItemProcessor<Product, TransProduct> processor() {
    return product -> {
      Long id = product.getId();
      String name = product.getName();
      Long price = product.getPrice();
      String created =product.getCreated().format(DateTimeFormatter.ofPattern("yyyy-MM-dd hh:mm:ss"));
      if( price > 2500 ) {
        return new TransProduct(id, name, price - 500L, created, true);
      } else {
        return new TransProduct(id, name, price, created, false);
      }
    };
  }

  @Bean
  public JdbcBatchItemWriter<TransProduct> writer() {
    return new JdbcBatchItemWriterBuilder<TransProduct>()
                .dataSource(dataSource)
                .sql("INSERT INTO transproduct(id, name, price, create, )")
  }
}