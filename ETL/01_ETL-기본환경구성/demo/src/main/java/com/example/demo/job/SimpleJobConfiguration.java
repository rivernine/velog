package com.example.demo.job;

import org.springframework.batch.core.Job;
import org.springframework.batch.core.Step;
import org.springframework.batch.core.configuration.annotation.JobBuilderFactory;
import org.springframework.batch.core.configuration.annotation.StepBuilderFactory;
import org.springframework.batch.repeat.RepeatStatus;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;

@Slf4j  // Log 사용을 위한 Lombok 어노테이션
@RequiredArgsConstructor  // 생성자 자동 생성
@Configuration  // Spring Batch의 모든 Job은 @Configuration으로 등록해서 사용한다.
public class SimpleJobConfiguration {
  private final JobBuilderFactory jobBuilderFactory;  // 생성자 DI 받음
  private final StepBuilderFactory stepBuilderFactory;  // 생성자 DI 받음

  @Bean
  public Job simpleJob() {
    // simpleJob이란 이름의 Batch job을 생성한다.
    return jobBuilderFactory.get("simpleJob")
            .start(simpleStep1())
            .build();
  }

  @Bean
  public Step simpleStep1() {
    // simpleStep1 이란 이름의 Batch Step을 생성한다.
    return stepBuilderFactory.get("simpleStep1")
            // Step 안에서 수행될 기능을 명시한다.
            .tasklet((contribution, chunkContext) -> {
              log.info(">>>>> This is Step1");
              return RepeatStatus.FINISHED;
            })
            .build();
  }
}
