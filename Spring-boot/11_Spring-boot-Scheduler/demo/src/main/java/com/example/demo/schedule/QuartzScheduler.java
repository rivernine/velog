package com.example.demo.schedule;

import static org.quartz.JobBuilder.newJob;

import java.util.HashMap;
import java.util.Map;

import javax.annotation.PostConstruct;

import org.quartz.CronScheduleBuilder;
import org.quartz.JobDataMap;
import org.quartz.JobDetail;
import org.quartz.Scheduler;
import org.quartz.SchedulerException;
import org.quartz.Trigger;
import org.quartz.TriggerBuilder;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.context.annotation.Configuration;

import com.example.demo.schedule.QuartzJob;

import lombok.extern.slf4j.Slf4j;

@Slf4j
@Configuration
public class QuartzScheduler {
  
  @Autowired
  private Scheduler scheduler;

  @PostConstruct
  public void start() {
    JobDetail aggreReqJobDetail = buildJobDetail(QuartzJob.class, "testJob", "test", new HashMap());
    try{
      scheduler.scheduleJob(aggreReqJobDetail, buildJobTrigger("0 * * * * ?"));
    } catch(SchedulerException e) {
      e.printStackTrace();
    }
  }

  public Trigger buildJobTrigger(String scheduleExp) {
    return TriggerBuilder.newTrigger()
            .withSchedule(CronScheduleBuilder.cronSchedule(scheduleExp)).build();
  }

  public JobDetail buildJobDetail(Class job, String name, String group, Map params) {
    JobDataMap jobDataMap = new JobDataMap();
    jobDataMap.putAll(params);

      return newJob(job).withIdentity(name, group)
              .usingJobData(jobDataMap)
              .build();
  }
}
