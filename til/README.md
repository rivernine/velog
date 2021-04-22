# tmp
## 메타 데이터 테이블
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

## JobBuilderFactory syntax
- `start($STEP_METHOD)`
  - $STEP_METHOD를 실행한다.
- `next($STEP_METHOD)`
  - 순차적으로 *step*들을 연결시킬 때 사용한다.

## 지정한 Batch Job만 실행
기본적으로 등록되어진 모든 job이 실행된다.
원하는 batch job만 실행하고 싶은 경우 사용한다.
1. `application.yml` 추가
Program arguments로 `job.name`이 넘어오면 해당 값과 일치하는 job만 실행하는 옵션
  - `job.name`이 있으면 `job.name`할당, 없으면 `NONE`할당
```yml
spring.batch.job.names: ${job.name:NONE}
```
2. 실행
다음은 **Program arguments**를 선언하는 방법이다.
`java -jar *.jar --job.name=stepNextJob`
3. Job parameter와 Program arguments를 같이 주는 방법
**Job parameter**는 `version=1`과 같이 써준다.
**Program arguments**는 `--job.name`과 같이 `--`을 붙여준다.
`java -jar *.jar version=1 --job.name=stepNextJob`

## 조건으로 step 분기
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

## Batch Status, Exit Status
**Batch Status**와 **Exit Status**의 차이를 다룬다.

- Batch Status
  - Job또는 Step의 실행 결과를 Spring에서 기록할 때 사용하는 Enum
- Exit Status
  - Step의 실행 후 상태
- ExitStatus의 exitCode는 Step의 BatchStatus와 같다.