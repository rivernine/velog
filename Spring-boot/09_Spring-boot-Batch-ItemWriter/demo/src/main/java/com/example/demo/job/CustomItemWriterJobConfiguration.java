package com.example.demo.job;

import java.util.List;

import javax.persistence.EntityManagerFactory;

import com.example.demo.domain.pay.Pay;
import com.example.demo.domain.pay.Pay2;

import org.springframework.batch.core.Job;
import org.springframework.batch.core.Step;
import org.springframework.batch.core.configuration.annotation.JobBuilderFactory;
import org.springframework.batch.core.configuration.annotation.StepBuilderFactory;
import org.springframework.batch.item.ItemProcessor;
import org.springframework.batch.item.ItemWriter;
import org.springframework.batch.item.database.JpaPagingItemReader;
import org.springframework.batch.item.database.builder.JpaPagingItemReaderBuilder;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;

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
