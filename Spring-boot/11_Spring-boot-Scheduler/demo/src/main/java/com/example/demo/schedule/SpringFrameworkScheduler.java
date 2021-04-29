package com.example.demo.schedule;

import java.util.Date;

import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Component;

@Component
public class SpringFrameworkScheduler {
  
  @Scheduled(fixedDelay = 1000)
  public void printJob() {
    System.out.println(new Date());
  }
}
