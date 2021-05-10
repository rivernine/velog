# ETL 기본환경구성

## 🎁 Contents
- [ETL 기본환경구성](#etl-기본환경구성)
  - [🎁 Contents](#-contents)
  - [0. Summary](#0-summary)
  - [1. Launch databases](#1-launch-databases)
    - [1.1. Create `docker-compose.yaml`](#11-create-docker-composeyaml)
    - [1.2. `db-source`: Create table & Insert sample data](#12-db-source-create-table--insert-sample-data)
    - [1.3. `db-source`: Create Metadata table](#13-db-source-create-metadata-table)
    - [1.4. `db-source`: Set the authority](#14-db-source-set-the-authority)
    - [1.5. `db-target`: Create table](#15-db-target-create-table)
    - [1.6. `db-target`: Set the authority](#16-db-target-set-the-authority)
  - [2. Configure Spring-boot](#2-configure-spring-boot)
    - [2.1. Add dependencies](#21-add-dependencies)
    - [2.2. Create DTO](#22-create-dto)
    - [2.3. Multiple Database access configuration](#23-multiple-database-access-configuration)
    - [2.3.1 Update `application.yml`](#231-update-applicationyml)
    - [2.3.2. Create `DataSourceConfiguration.java`](#232-create-datasourceconfigurationjava)
    - [2.3.3. How to use](#233-how-to-use)

## 0. Summary
**ETL**이란 추출(Extraction), 변환(Transformation), 적재(Load)의 약어이다.
Database에 있는 데이터를 **추출**하여, 원하는 형태로 **변환**하고 다른 Database에 **적재**하는 작업이다.
> 데이터분석에서는 빠지지않는 중요한 개념이다.

본 시리즈에서는 ETL의 전체를 다루며 다음을 사용한다.
- Database : MariaDB
- Batch : Spring Batch
- Scheduler : Jenkins

MariaDB와 Jenkins는 docker를 활용하여 서비스한다.

먼저 ETL을 위한 기본환경구성을 한다.

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

### 1.2. `db-source`: Create table & Insert sample data
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

### 1.3. `db-source`: Create Metadata table
Spring batch가 작동하기 위해 필요한 테이블들이 정해져있다.
이를 **메타데이터 테이블**이라고 부른다.
`H2`와 같은 인메모리 DB를 사용하면 Spring-boot에서 자동으로 만들어주지만, `MySQL`과 같이 별개의 DB를 사용하면 수동으로 만들어야 한다.
> 사용하는 Database별로 스키마가 정해져 있다. [**스키마 링크**](https://github.com/spring-projects/spring-batch/tree/main/spring-batch-core/src/main/resources/org/springframework/batch/core)

본 문서에서는 `MySQL`을 사용하므로 `schema-mysql.sql`을 사용한다.
```sh
docker exec -it db-source bash

mysql -u root -p
# Enter password
```
```mysql
use etl;
<!-- Paste schema-mysql.sql -->
show tables;
```

### 1.4. `db-source`: Set the authority
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

### 1.5. `db-target`: Create table
```mysql
CREATE DATABASE etl;
USE etl;

CREATE TABLE trans_product  (
  id         bigint not null auto_increment,
  name     varchar(255),
  price     bigint,
  created datetime,
  discount boolean,
  primary key (id)
) engine = InnoDB;

grant all privileges on etl.* to rivernine@'%' identified by 'rivernine';
```

### 1.6. `db-target`: Set the authority
`etl` 데이터베이스의 사용자를 만들고 권한을 부여한다.
```sh
docker exec -it db-target bash

mysql -u root -p
# 패스워드 입력

grant all privileges on etl.* to rivernine@'%' identified by 'rivernine';
exit

# 확인
mysql -u rivernine -p
# rivernine
show databases;
```


## 2. Configure Spring-boot
ETL을 사용하기 위해 Spring-boot 환경설정을 한다.
우선, `build.gradle, application.yaml`을 수정하고 DTO를 정의한 후 `Job`을 생성한다.

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
	// testImplementation 'org.springframework.boot:spring-boot-starter-test'
	// testImplementation 'org.springframework.batch:spring-batch-test'
}
```

### 2.2. Create DTO
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

- `TransProduct.java`
```java
@ToString
@Getter
@Setter
@NoArgsConstructor
public class TransProduct {
  private static final DateTimeFormatter FORMATTER = DateTimeFormatter.ofPattern("yyyy-MM-dd hh:mm:ss");

  private Long id;
  private String name;
  private Long price;
  private LocalDateTime created;
  private boolean discount;

  public TransProduct(String name, Long price, String created, boolean discount) {
    this.price = price;
    this.name = name;
    this.created = LocalDateTime.parse(created, FORMATTER);
    this.discount = discount;
  }

  public TransProduct(String name, Long price, LocalDateTime created, boolean discount) {
    this.price = price;
    this.name = name;
    this.created = created;
    this.discount = discount;
  }

  public TransProduct(Long id, String name, Long price, String created, boolean discount) {
    this.id = id;
    this.price = price;
    this.name = name;
    this.created = LocalDateTime.parse(created, FORMATTER);
    this.discount = discount;
  }
}
```

### 2.3. Multiple Database access configuration
`db-source`와 `db-target`에 동시 접근하기 위해서는 `datasource`수정이 필요하다.

### 2.3.1 Update `application.yml`
먼저, `application.yml`에 `db-source`와 `db-target`의 `datasource` 정보를 입력한다.
```yaml
spring:
  profiles: mysql
  datasource-dbsource:
    hikari:
      # MYSQL_ADDR:PORT/DATABASE
      jdbc-url: jdbc:mysql://192.168.56.103:3306/etl
      username: rivernine
      password: rivernine
      # mysql용 jdbc드라이버
      driver-class-name: com.mysql.jdbc.Driver
  datasource-dbtarget:
    hikari:
      jdbc-url: jdbc:mysql://192.168.56.103:3307/etl
      username: rivernine
      password: rivernine      
      driver-class-name: com.mysql.jdbc.Driver
```

### 2.3.2. Create `DataSourceConfiguration.java`
`config/DataSourceConfiguration.java`를 생성하고 수정한다.
```java
@Configuration
public class DataSourceConfiguration {
  @Bean(name = "dataSource-dbsource")
  @Primary
  @ConfigurationProperties(prefix="spring.datasource-dbsource.hikari")
  public DataSource dataSourceDbSource() {
    return DataSourceBuilder.create().build();
  }

  @Bean(name = "dataSource-dbtarget")
  @ConfigurationProperties(prefix="spring.datasource-dbtarget.hikari")
  public DataSource dataSourceDbTarget() {
    return DataSourceBuilder.create().build();
  }
}
```

### 2.3.3. How to use
이제 사용하고자 하는 클래스 내부에 다음과 같이 선언하고 사용한다.
```java
@Qualifier("dataSource-dbsource")
@Autowired
private DataSource dataSourceDbSource;

@Qualifier("dataSource-target")
@Autowired
private DataSource dataSourceDbTarget;
```

---
**모든 소스는 [Github](https://github.com/rivernine/velog/tree/master/Spring-boot)에 올려놓았다.**