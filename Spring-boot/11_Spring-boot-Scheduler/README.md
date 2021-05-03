# Spring-boot Scheduler
## 🎁 Contents
- [Spring-boot Scheduler](#spring-boot-scheduler)
  - [🎁 Contents](#-contents)
  - [0. Summary](#0-summary)
  - [1. Spring-boot Framework Scheduler](#1-spring-boot-framework-scheduler)
    - [1.1. Enable Scheduling](#11-enable-scheduling)
    - [1.2 Create Job](#12-create-job)
    - [1.3 Execute](#13-execute)
    - [1.4 Check](#14-check)
  - [2. Quartz](#2-quartz)
    - [2.1. About Quartz](#21-about-quartz)
  - [3. Jenkins](#3-jenkins)
    - [3.1. Create `docker-compose.yaml`](#31-create-docker-composeyaml)
    - [3.2. Run Jenkins](#32-run-jenkins)
    - [3.3. Init Jenkins](#33-init-jenkins)
  - [4. Create `jar` file](#4-create-jar-file)
    - [4.1. Execute `jar`](#41-execute-jar)
    - [4.2. Check](#42-check)
  - [5. Set the Schedule](#5-set-the-schedule)
    - [5.1. Create item](#51-create-item)
    - [5.2. Enter an item name](#52-enter-an-item-name)
    - [5.3. Move jar to Jenkins workspace](#53-move-jar-to-jenkins-workspace)
    - [5.4. Set the schedule](#54-set-the-schedule)
  - [6. Check](#6-check)
  
## 0. Summary
Linux crontab과 같은 scheduler를 Spring-boot에서 다뤄보자.
본 문서에서는 다음과 같은 job scheduler를 다룰 것이다.
- Spring-boot Framework Scheduler
- Quartz
- Jenkins

**최종적으로 Jenkins Scheduler를 이용해 Spring-batch를 핸들링 할 것이다.**

## 1. Spring-boot Framework Scheduler
Spring-boot 자체적으로 지원하는 Scheduler로 `@EnableScheduling, @Scheduled`만으로 간단하게 구현 가능하다.
**간단한 Job Scheduling을 할 때 사용하면 좋다.**
### 1.1. Enable Scheduling
Spring-boot 진입점에 `@EnableScheduling`을 선언한다.
- `DemoApplication.java`
```java
@EnableScheduling
@SpringBootApplication
public class DemoApplication {
  public static void main(String[] args) {
    SpringApplication.run(DemoApplication.class, args);
  }
}
```

### 1.2 Create Job
주기적으로 실행될 Job을 구현한다.
- `SpringFrameworkScheduler.java`
```java
@Component
public class SpringFrameworkScheduler {
  
  @Scheduled(fixedDelay = 1000)
  public void printJob() {
    System.out.println(new Date());
  }
}
```
- `@Scheduled(fixedDelay = 1000)`
  - 1000ms 주기로 메소드를 반복한다.
  - `fixedDelay`외에도 `fixedRate, initialDelay, cron`등 다양한 옵션을 사용할 수 있다.
- 다음은 자주 쓰이는 `cron`의 옵션이다.
  - `(cron = "초 분 시 일 월 요일")`
  - `*` : all
  - `?` : none
  - `m` : array
  - `a-b` : a부터 b까지
  - `a/b` : a부터 b마다. a, a+b, a+b+b, ...
### 1.3 Execute
```sh
./gradlew build -x test

java -jar ./build/libs/*.jar
```

### 1.4 Check
![](./1.PNG)

1000ms주기로 출력이 되는 것을 확인할 수 있다.

## 2. Quartz
자바로 개발된 오픈소스 Job Scheduling 라이브러리로 보다 다양한 기능을 제공한다.
Clustering기능을 제공하고 여러 플러그인을 제공한다.
다만 완벽한 Cluster간 로드 분산은 안된다.

**Quartz에서는 Job을 관리하기가 쉽지않다.**
전반적인 scheduler관리를 위해 관리 UI를 따로 만들어야 한다면 그것또한 큰 공수가 들어갈 것이다.
그래서 우리가 흔히 알고있는 CI Tool, **Jenkins**를 적극 이용할 것이다.

### 2.1. About Quartz
- `Job`
  - `execute` 인터페이스를 제공한다.
  - 실제 작업을 `execute` 메서드에 구현하면 된다.
- `JobDataMap`
  - Job 인스턴스가 실행할 때 사용할 수 있는 정보를 담을 수 있다.
- `JobDetail`
  - Job을 실행시키기 위한 정보를 담고있다.
  - JobDetail 정보를 기반으로 Trigger가 스케줄링한다.
- `Trigger`
  - Job을 실행시킬 스케줄링 조건을 담고있다.
  - `SimpleTrigger, CronTrigger`로 지정할 수 있다.
- `Misfire Instructions`
  - 불발된 Trigger에 대한 policy를 지원한다.
- `Listener`
   -  `JobListener`
      -  Job 실행 전/후
   -  `TriggerListener`
      -  Trigger 발생/불발/완료
- `JobStore`
  - Job과 Trigger를 `RAMJobStore`나 `JDBCJobStore`방식으로 저장 가능하다.

## 3. Jenkins
Jenkins를 통해 배치를 실행할 수 있다. 
만일 이미 Jenkins를 사용하고 있다면 **배치 Jenkins와 배포 Jenkins를 분리하는 것을 추천한다.**

### 3.1. Create `docker-compose.yaml`
```sh
vim docker-compose.yaml
```

```yaml
version: '2'

networks:
  ci:

services:
  jenkins:
    container_name: jenkins
    image: jenkins/jenkins
    # 원하는 경로에 volume 마운트
    volumes:
      - ~/jenkins/:/var/jenkins_home
    networks:
      - ci
```

### 3.2. Run Jenkins
```sh
docker-comopse up -d

# 확인
docker ps
docker logs -f jenkins
```

### 3.3. Init Jenkins
Jenkins를 올린 서버의 8080포트를 들어가서 Password를 입력해야한다.
초기 패스워드는 다음 경로에서 확인 가능하다.
```sh
# 1. docker log
docker logs -f jenkins

# 2. read password file
cat /var/jenkins_home/secrets/initialAdminPassword
```

패스워드를 입력하고 플러그인들을 다운받고 다음단계에서 계정을 생성하면 Jenkins 초기셋팅이 완료된다.
> 향후 Jenkins에서 원하는 플러그인을 모두 받을 수 있다.

## 4. Create `jar` file
Jenkins가 구동되는 서버에 Spring-boot `jar`파일을 옮기는 작업이다.
**Jenkins는 해당 `jar`파일을 설정된 주기로 실행시켜주는 역할을 할 것이다.**

아래는 spring batch의 `jar`파일을 다룬다.
> 모든 소스는 페이지 하단 링크에 있다.

### 4.1. Execute `jar`
Spring-boot 환경의 서버에서 jar를 만든 후 Jenkins서버에 jar파일을 옮긴다.
```sh
##### Spring-boot Server #####
# 다음을 통해 Spring batch를 jar로 만든다.
./gradlew build

# Jenkins 서버에 jar파일을 복제한다.
scp ./build/libs/*.jar $USER@$JENKINS_SERVER:~


##### Jenkins Server #####
# Jar파일 실행
java -jar ~/*.jar
```

### 4.2. Check
![](./2.png)
Jenkins서버에서 `jar`를 실행하면 다음과 같은 결과를 확인할 수 있다.
`simpleStep1`이 실행된 것을 볼 수 있다.

이 작업을 Jenkins Scheduler가 주기적으로 실행시켜줄 것이다!

## 5. Set the Schedule
Jenkins에서 스케줄링을 등록한다.

### 5.1. Create item
![](./3.png)

### 5.2. Enter an item name
![](./4.png)

### 5.3. Move jar to Jenkins workspace
item을 만들면 workspace가 생성된다.
새로운 workspace에 `jar`를 옮기기 위한 작업이다.
![](./5.png)

![](./6.png)

저장을 한 후, `Build Now`를 통해 빌드를 해준다.
![](./7.png)

아래를 따라 들어가면 로그를 볼 수 있다.
`Build History` > `#number` > `Console Output`

로그를 보자.
`$PWD`가 jenkins agent의 Workspace인것을 알 수 있다.
> 실제 jenkins container나 volume mount경로를 보면 확인할 수 있다.

해당 경로에 `jar`파일을 옮긴다.
![](./8.png)
![](./9.png)

### 5.4. Set the schedule
이제 `jar`파일을 주기적으로 실행시켜주면 끝이다.
`구성`을 눌러 방금 생성한 item를 수정한다.
![](./10.png)

주기를 정해준다. (ex. 1분마다)
![](./11.png)

쉘 스크립트에 다음을 추가해준다.
`java -jar demo-0.0.1-SNAPSHOT.jar`
![](./12.png)

## 6. Check
이제 Jenkins가 1분마다 빌드를 하는것을 볼 수 있다.
![](./13.png)

로그를 살펴보면 다음과 같다.
![](./14.png)

이제 Spring batch를 Jenkins Scheduler로 핸들링하는 작업을 할 수 있게 되었다.

---
**모든 소스는 [깃허브](https://github.com/rivernine/velog/tree/master/Spring-boot)에 올려놓았다.**
