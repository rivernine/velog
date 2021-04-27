package com.example.demo.job;

import org.springframework.batch.core.ExitStatus;
import org.springframework.batch.core.Job;
import org.springframework.batch.core.Step;
import org.springframework.batch.core.configuration.annotation.JobBuilderFactory;
import org.springframework.batch.core.configuration.annotation.StepBuilderFactory;
import org.springframework.batch.repeat.RepeatStatus;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;

@Slf4j
@Configuration
@RequiredArgsConstructor
public class StepNextConditionalJobConfiguration {
  
  private final JobBuilderFactory jobBuilderFactory;
  private final StepBuilderFactory stepBuilderFactory;

  @Bean
  public Job stepNextConditionalJob(){
    return jobBuilderFactory.get("stepNextConditionalJob")
          .start(conditionalJobStep1())
            .on("FAILED") // if FAILED
            .to(conditionalJobStep3())  // step3로 이동
            .on("*")  // step3의 결과에 관계 없이
            .end()    // step3으로 이동 후 flow 종료
          .from(conditionalJobStep1())  // step1로부터
            .on("*")  // FAILED외 모든 경우
            .to(conditionalJobStep2())  // step2로 이동
            .next(conditionalJobStep3())  // step2 정상 종료 후 step3으로 이동
            .on("*")  // step3의 결과에 관계 없이
            .end()
          .end()
          .build();
  }

  @Bean
  public Step conditionalJobStep1() {
    return stepBuilderFactory.get("step1")
            .tasklet((contribution, chunkContext) -> {
              log.info(">>>>> This is stepNextConditionalJob Step1");
              contribution.setExitStatus(ExitStatus.FAILED);

              return RepeatStatus.FINISHED;
            })
            .build();
  }

  @Bean
  public Step conditionalJobStep2() {
    return stepBuilderFactory.get("step2")
            .tasklet((contribution, chunkContext) -> {
              log.info(">>>>> This is stepNextConditionalJob Step2");
              return RepeatStatus.FINISHED;
            })
            .build();
  }

  @Bean
  public Step conditionalJobStep3() {
    return stepBuilderFactory.get("step3")
            .tasklet((contribution, chunkContext) -> {
              log.info(">>>>> This is stepNextConditionalJob Step3");
              return RepeatStatus.FINISHED;
            })
            .build();
  }
} 

