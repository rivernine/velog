# Spring-boot Hello world
## 🎁 목차
- [Spring-boot Hello world](#Spring-boot-Hello-world)
  - [🎁 목차](#-목차)
  - [0. 개요](#0.-개요)
  - [1. Install java](#1.-Install-java)
  - [2. Generate spring](#2.-Generate-spring)
  - [3. Start](#3.-Start)
## 0. 개요
* Gradle을 이용하여 **gradle 설치 없이** 스프링부트 예제를 만들어보자 !   
* 프로젝트 생성은 `initializr`로, 실행은 java로 할 것이다.

## 1. Install java
```sh
sudo apt-get update
sudo apt-get install default-jdk
```

## 2. Generate spring
* 다음 페이지에서 spring init
  - [spring initializr](!https://start.spring.io/)
    - Project : `Gradle Project`
    - Langauge : `Java`
    - Spring Boot : `2.4.4`
    - Project Metadata : `default`
  - Generate
  - file unzip

## 3. Start
```sh
cd $PROJECT_HOME
./gradlew build -x Test

java -jar ./build/libs/*.jar
```