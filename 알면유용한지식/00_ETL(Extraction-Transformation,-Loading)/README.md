# ETL(Extraction Transformation, Loading)

## 🎁 Contents
- [ETL(Extraction Transformation, Loading)](#etlextraction-transformation-loading)
  - [🎁 Contents](#-contents)
  - [0. Summary](#0-summary)
  - [1. Launch databases](#1-launch-databases)
    - [1.1. Create `docker-compose.yaml`](#11-create-docker-composeyaml)
    - [1.2. Insert sample data into `db-source`](#12-insert-sample-data-into-db-source)
    - [1.3. Set the authority](#13-set-the-authority)
  - [2. Create Job](#2-create-job)
    - [2.1. Add dependencies](#21-add-dependencies)
    - [2.2. Update `application.yml`](#22-update-applicationyml)
    - [2.3. Create DTO](#23-create-dto)
    - [2.4. Create Job](#24-create-job)
  - [3. Create ItemReader (**Extraction**)](#3-create-itemreader-extraction)

## 0. Summary
**ETL**이란 추출(Extraction), 변환(Transformation), 적재(Load)의 약어이다.
Database에 있는 데이터를 **추출**하여, 원하는 형태로 **변환**하고 다른 Database에 **적재**하는 작업이다.
> 데이터분석에서는 빠지지않는 중요한 개념이다.

본 문서에서는 ETL의 전체를 다루며 다음을 사용한다.
- Database : MariaDB
- Batch : Spring Batch
- Scheduler : Jenkins

MariaDB와 Jenkins는 docker를 활용하여 서비스한다.

## 1. Launch databases
mariadb container를 총 2개를 띄운다.
`db-source`의 데이터를 변환하여 `db-target`에 적재할 것이다.

MariaDB는 `sudo su`를 통해 접속하거나 `mysql -u root -p`로 루트 패스워드를 입력하고 접속해야한다.
container로 DB를 올리면 `MYSQL_ROOT_PASSWORD`라는 환경변수를 설정하고 이를 로그인할때 입력해야 한다.
> **초기 구동 후 해당 환경변수를 지운 후 재기동한다.**

### 1.1. Create `docker-compose.yaml`
```sh
mkdir -p ~/etl-sample
touch ~/etl-sample/docker-compose.yaml
```
```yaml
version: '3.1'

services:
  db-source:
    container_name: db-source
    image: mariadb:latest
    restart: always
    ports:
      - 3306:3306
    volumes:
      - /data/db-source/data:/var/lib/mysql
      - /data/db-source/config:/etc/mysql/conf.d
    environment:
      TZ: Asia/Seoul
      # mysql을 처음 서비스할때에 root password가 필요하다.
      # 아래의 환경변수를 포함하여 올린 후 지워준다.
      # MYSQL_ROOT_PASSWORD: ${PASSWORD}
  db-target:
    container_name: db-target
    image: mariadb:latest
    restart: always
    ports:
      - 3307:3306
    volumes:
      - /data/db-target/data:/var/lib/mysql
      - /data/db-target/config:/etc/mysql/conf.d
    environment:
      TZ: Asia/Seoul
      # MYSQL_ROOT_PASSWORD: ${PASSWORD}
```
```sh
cd ~/etl-sample
# 초기 구동
docker-compose up -d

# 재시작
## docker-compose downd은 docker rm을 포함하고 있기에 volume설정을 확인하자.
docker-compose down
docker-compose up -d
```

### 1.2. Insert sample data into `db-source`
`db-source`에 샘플데이터를 넣는 작업이다.
```sh
docker exec -it db-source bash

mysql -u root -p
# 패스워드 입력
```
```mysql
CREATE DATABASE etl;
USE etl;

CREATE TABLE product  (
  id         bigint not null auto_increment,
  name     varchar(255),
  price     bigint,
  created datetime,
  primary key (id)
) engine = InnoDB;

INSERT INTO product (name, price, created) VALUES ('product1', 1000, '2021-05-04 00:00:00');
INSERT INTO product (name, price, created) VALUES ('product2', 2000, '2021-05-04 00:00:00');
INSERT INTO product (name, price, created) VALUES ('product3', 3000, '2021-05-04 00:00:00');
INSERT INTO product (name, price, created) VALUES ('product4', 4000, '2021-05-04 00:00:00');
```

### 1.3. Set the authority
`etl` 데이터베이스의 사용자를 만들고 권한을 부여한다.
```sh
docker exec -it db-source bash

mysql -u root -p
# 패스워드 입력

# $USER에게 etl db의 접근 권한을 부여한다. 
# 만일, $USER가 없다면 새로 생성한다.
# grant all privileges on $DATABASE.* to $USER@'%' identified by '$PASSWORD';
grant all privileges on etl.* to rivernine@'%' identified by 'rivernine';
exit

# 확인
mysql -u rivernine -p
# rivernine
show databases;
```

## 2. Create Job
이제 `db-source`의 데이터를 **Spring Batch**를 이용하여 추출해보자.
우선, `build.gradle, application.yaml`을 수정하고 DTO를 정의한 후 `Job`을 생성한다..

> 보다 자세한 내용은 [이전 글](https://velog.io/@rivernine/Spring-boot-Batch)에서 다루었다.

### 2.1. Add dependencies
`build.gradle`에 ETL에 필요한 라이브러리를 추가한다.
```groovy
dependencies {
	implementation (
		'org.springframework.boot:spring-boot-starter-batch',			// Batch
		'org.springframework.boot:spring-boot-starter-jdbc',			// Jdbc
		'org.projectlombok:lombok',																// Lombok
		'mysql:mysql-connector-java',															// Mysql
	)
	annotationProcessor 'org.projectlombok:lombok'

	// test
	testImplementation 'org.springframework.boot:spring-boot-starter-test'
	testImplementation 'org.springframework.batch:spring-batch-test'
}
```

### 2.2. Update `application.yml`
```yaml
spring:
  profiles: mysql
  datasource:
    hikari:
      # MYSQL_ADDR:PORT/DATABASE
      jdbc-url: jdbc:mysql://192.168.56.103:3306/etl
      username: rivernine
      password: rivernine
      # mysql용 jdbc드라이버
      driver-class-name: com.mysql.jdbc.Driver
```

### 2.3. Create DTO
- `Product.java`
```java
@ToString
@Getter
@Setter
@NoArgsConstructor
@Entity
public class Product {
  private static final DateTimeFormatter FORMATTER = DateTimeFormatter.ofPattern("yyyy-MM-dd hh:mm:ss");

  @Id
  @GeneratedValue(strategy = GenerationType.IDENTITY)
  private Long id;
  private String name;
  private Long price;
  private LocalDateTime created;

  public Product(String name, Long price, String created) {
    this.price = price;
    this.name = name;
    this.created = LocalDateTime.parse(created, FORMATTER);
  }

  public Product(Long id, String name, Long price, String created) {
    this.id = id;
    this.price = price;
    this.name = name;
    this.created = LocalDateTime.parse(created, FORMATTER);
  }
}
```

### 2.4. Create Job
Spring Batch가 실행할 `Job`을 생성한다.
`ItemReader(), ItemProcessor(), ItemWriter()`의 진입점을 만든다.

- `ETLJob.java`
```java
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
}
```

## 3. Create ItemReader (**Extraction**)
Spring batch 중 Batch data를 읽어오는 인터페이스 `ItemReader`를 만들 것이다.
`Job`의 `reader()` 메소드를 구현한다.
