# ETL(Extraction Transformation, Loading)

## 🎁 목차
- [ETL(Extraction Transformation, Loading)](#etlextraction-transformation-loading)
  - [🎁 목차](#-목차)
  - [0. 개요](#0-개요)
  - [1. MariaDB](#1-mariadb)

## 0. 개요
<!-- 데이터 분석에 활용할 DB를 만들고 기존의 데이터를 이관하는 작업이다.
기존 DB는 container로 떠있고, 새로운 DB도 마찬가지로 container로 띄운다.
batch작업은 spring-boot로 진행한다. -->

## 1. MariaDB
mariadb container를 총 2개를 띄운다.
```sh
mkdir ~/{db,db-clone}
touch ~/db/docker-compose.yaml
touch ~/db-clone/docker-compose.yaml
```
```yaml
# db
version: '3.1'

services:
  db:
    container_name: db
    image: mariadb:latest
    restart: always
    ports:
      - 3307:3306
    volumes:
      - /data/db/data:/var/lib/mysql
      - /data/db/config:/etc/mysql/conf.d
    environment:
      TZ: Asia/Seoul
      # mysql을 처음 서비스할때에 root password가 필요하다.
      # 아래의 환경변수를 포함하여 올린 후 지워준다.
      # MYSQL_ROOT_PASSWORD: ${PASSWORD}

# db-clone
version: '3.1'

services:
  db-clone:
    container_name: db-clone
    image: mariadb:latest
    restart: always
    ports:
      - 3307:3306
    volumes:
      - /data/db-clone/data:/var/lib/mysql
      - /data/db-clone/config:/etc/mysql/conf.d
    environment:
      TZ: Asia/Seoul
      # MYSQL_ROOT_PASSWORD: ${PASSWORD}
```