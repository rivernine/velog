# Spring-boot Batch Job
## 🎁 Contents
- [Spring-boot Batch Job](#spring-boot-batch-job)
  - [🎁 Contents](#-contents)
  - [0. Summary](#0-summary)
  - [1. Metadata Table](#1-metadata-table)
  - [2. About JobBuilderFactory](#2-about-jobbuilderfactory)
    - [2.1. Syntax](#21-syntax)
    - [2.2. Step for condition](#22-step-for-condition)
  - [3. Job Parameter, Scope](#3-job-parameter-scope)
    - [3.1. Usage Job Parameter](#31-usage-job-parameter)
    - [3.2. Usage Scope](#32-usage-scope)
    - [3.3. Scope and Bean](#33-scope-and-bean)
  - [4. Execute specific Job](#4-execute-specific-job)
    - [4.1. `application.yml` 추가](#41-applicationyml-추가)
    - [4.2. Execute](#42-execute)
    - [4.3. How to use Job parameter with Program arguments](#43-how-to-use-job-parameter-with-program-arguments)
  - [5. Execute Job in Controller](#5-execute-job-in-controller)


## 0. Summary
**Spring-boot Batch Job** 관련 내용들이다.

## 1. Metadata Table
Spring batch가 실행되기 위해서는 **메타데이터 테이블**이 필수로 존재해야 한다.
메타데이터 테이블은 사용하는 DB에서 테이블조회를 통해 볼 수 있다.
각 테이블의 역할을 알아보자.

- `BATCH_JOB_INSTANCE`
  - Job Parameter의 정보가 저장된다.
  - 동일 Job의 Job Parameter가 달라지면 그때마다 `BATCH_JOB_INSTANCE`에 생성된다.
  - 동일한 Job Parameter는 여러 개 존재할 수 없다.
  > **Job Parameter**는 `java -jar *.jar $PARAM=$VALUE` 로 넣어준다.
- `BATCH_JOB_EXECUTION`
  - `BATCH_JOB_INSTANCE`의 **child** 관계
  - `BATCH_JOB_INSTANCE`의 성공/실패의 내역을 가지고 있다.
- `BATCH_JOB_EXECUTION_PARAMS`
  - `BATCH_JOB_EXECUTION`이 생성될 당시 입력받은 Job Parameter를 담고있다.

## 2. About JobBuilderFactory
Job을 정의할 수 있는 `JobBuilderFactory`에 대해 알아본다.
### 2.1. Syntax
  - `start($STEP_METHOD)`
    -  $STEP_METHOD를 실행한다.
  - `next($STEP_METHOD)`
    -  순차적으로 *step*들을 연결시킬 때 사용한다.

### 2.2. Step for condition
조건에 따라 분기하여 서로 다른 step을 실행하는 경우 사용한다.
- 예제코드
```java
@Bean
public Job stepNextConditionalJob(){
  return jobBuilderFactory.get("setpNextConditionalJob")
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
```
- `on()`
  - catch할 **ExitStatus**지정
- `to()`
  - 이동할 step 지정
- `from()`
  - **ExitStatus**을 보고 이벤트 캐치
- `end()`
  - `on()`뒤에 있는 `end()`는 FlowBuilder를 반환한다.
  - `build()`앞에 있는 `end()`는 FlowBuilder를 종료한다.
- **Batch Status**와 **Exit Status**는 다르다.
  - Batch Status
    - Job또는 Step의 실행 결과를 Spring에서 기록할 때 사용하는 Enum
  - Exit Status
    - Step의 실행 후 상태
  - ExitStatus의 exitCode는 Step의 BatchStatus와 같다.



## 3. Job Parameter, Scope
Spring Batch에서는 외/내부에서 **Job Parameter**를 받아 Batch Component에서 사용할 수 있게 지원한다.
**Job Parameter**를 사용하기 위해선, 항상 Spring Batch Scope를 선언해야 한다. 

> Spring Batch Scope는 `@StepScope`와 `@JobScope`를 지칭한다.

### 3.1. Usage Job Parameter
```java
@Value("#{jobParameters[파라미터명]}")
```

### 3.2. Usage Scope
`@JobScope` : `Step`선언에서 사용한다.
`@StepScope` : `Tasklet, ItemReader, ItemWriter, ItemProcessor`선언에서 사용한다.
```java
@Bean
public Job scopeJob() {
  return jobBuilderFactory.get("scopeJob")
          .start(scopeStep1(null))
          .next(scopeStep2())
          .build();
}

@Bean
@JobScope
public Step scopeStep1(@Value("#{jobParameters[requestDate]}") String requestDate) {
  return stepBuilderFactory.get("scopeStep1")
          .tasklet((contribution, chunkContext) -> {
            log.info(">>>>> This is scopeStep1");
            log.info(">>>>> requestDate = {}", requestDate);
            return RepeatStatus.FINISHED;
          })
          .build();
}

@Bean
public Step scopeStep2() {
  return stepBuilderFactory.get("scopeStep2")
          .tasklet(scopeStep2Tasklet(null))
          .build();
}

@Bean
@StepScope
public Tasklet scopeStep2Tasklet(@Value("#{jobParameters[requestDate]}") String requestDate) {
  return (contribution, chunkContext) -> {
    log.info(">>>>> This is scopeStep2");
    log.info(">>>>> requestDate = {}", requestDate);
    return RepeatStatus.FINISHED;
  };
}
```
- `scopeStep1(null)`, `scopeStep2Tasklet(null)`
  - **Job Parameter** 할당이 어플리케이션 실행시 하지 않기 때문에 `null`을 할당한다.

### 3.3. Scope and Bean
`@StepScope`는 Step 실행 시점에 Bean이 생성된다.
마찬가지로 `@JobScope`는 Jop 실행 시점에 Bean이 생성된다.
**즉, Bean의 생성 시점을 지정된 Scope가 실행되는 시점으로 지연시킨다.**
> MVC의 request scope가 request/resoponse에 Bean이 생성/삭제가 되는 것 처럼 JobScope. StepScope역시 Job이 실행되고 끝날때, Step이 실행되고 끝날때 생성/삭제가 이루어진다.

이 기능을 통해 다음과 같은 장점을 가진다.
1. JobParameter의 Late Binding
   - Application 실행 시점이 아니더라도 Controller나 Service와 같은 **비지니스 로직 처리에서 Job Parameter를 할당할 수 있다.**
2. 동일 컴포넌트의 병렬처리

## 4. Execute specific Job
기본적으로 등록되어진 모든 job이 실행된다.
원하는 batch job만 실행하고 싶은 경우 사용한다.
### 4.1. `application.yml` 추가
Program arguments로 `job.name`이 넘어오면 해당 값과 일치하는 job만 실행하는 옵션
  - `job.name`이 있으면 `job.name`할당, 없으면 `NONE`할당
```yml
spring.batch.job.names: ${job.name:NONE}
```
### 4.2. Execute
다음은 **Program arguments**를 선언하는 방법이다.
`java -jar *.jar --job.name=stepNextJob`
### 4.3. How to use Job parameter with Program arguments
**Job parameter**는 `version=1`과 같이 써준다.
**Program arguments**는 `--job.name`과 같이 `--`을 붙여준다.
`java -jar *.jar version=1 --job.name=stepNextJob`

## 5. Execute Job in Controller
만약 외부에서 넘겨주는 파라미터에 따라 Batch가 다르게 실행되는 예제이다.
**그러나 웹서버에서 Batch를 관리하는 것은 권장되지 않는다.**
```java
@Slf4j
@RequiredArgsConstructor
@RestController
public class JobLauncherController {

  private final JobLauncher jobLauncher;
  private final Job job;

  @GetMapping("/launchjob")
  public String handle(@RequestParam("fileName") String fileName) throws Exception {

    try {
      JobParameters jobParameters = new JobParametersBuilder()
                              .addString("input.file.name", fileName)
                              .addLong("time", System.currentTimeMillis())
                              .toJobParameters();
      jobLauncher.run(job, jobParameters);
    } catch (Exception e) {
      log.info(e.getMessage());
    }

    return "Done";
  }
}
```
---

**모든 소스는 [깃허브](https://github.com/rivernine/velog/tree/master/Spring-boot)에 올려놓았다.**
**참고링크: [jojoldu 블로그](https://jojoldu.tistory.com/)**