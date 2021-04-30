package com.example.demo.schedule;

import org.quartz.InterruptableJob;
import org.quartz.JobExecutionContext;
import org.quartz.JobExecutionException;
import org.quartz.UnableToInterruptJobException;
import org.springframework.scheduling.quartz.QuartzJobBean;
import org.springframework.stereotype.Component;

import lombok.extern.slf4j.Slf4j;

@Component
@Slf4j
public class QuartzJob extends QuartzJobBean implements InterruptableJob {
  @Override
  public void interrupt() throws UnableToInterruptJobException {

  }

  @Override
  protected void executeInternal(JobExecutionContext context) throws JobExecutionException {
    log.info("1");
  }
}
