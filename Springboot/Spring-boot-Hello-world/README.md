# Gradle을 이용한 spring-boot Hello world
## 0. 개요
Gradle을 이용하여 간단한 스프링부트 예제를 만들어보자 !   

## 1. Install java
```sh
sudo apt-get update
sudo apt-get install default-jdk
```

## 2. Generate spring
* 다음 페이지에서 spring init
  - [spring initiaizr](!https://start.spring.io/)
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