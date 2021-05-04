# ETL(Extraction Transformation, Loading)

## 🎁 Contents
- [ETL(Extraction Transformation, Loading)](#etlextraction-transformation-loading)
  - [🎁 Contents](#-contents)
  - [0. Summary](#0-summary)
  - [1. Launch databases](#1-launch-databases)
    - [1.1. Create `docker-compose.yaml`](#11-create-docker-composeyaml)
    - [1.2. Insert sample data into `db-source`](#12-insert-sample-data-into-db-source)

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
```mysql
CREATE DATABASE etl;
USE etl;

CREATE TABLE source  (
  id         bigint not null auto_increment,
  name     varchar(255),
  price     bigint,
  created datetime,
  primary key (id)
) engine = InnoDB;

INSERT INTO source (name, price, created) VALUES ('product1', 1000, '2021-05-04 00:00:00');
INSERT INTO source (name, price, created) VALUES ('product2', 2000, '2021-05-04 00:00:00');
INSERT INTO source (name, price, created) VALUES ('product3', 3000, '2021-05-04 00:00:00');
INSERT INTO source (name, price, created) VALUES ('product4', 4000, '2021-05-04 00:00:00');
```
