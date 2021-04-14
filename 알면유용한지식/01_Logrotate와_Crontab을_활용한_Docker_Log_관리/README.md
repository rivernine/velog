# Logrotate와 Crontab을 활용한 Docker Log 관리

## 🎁 목차
- [Logrotate와 Crontab을 활용한 Docker Log 관리](#logrotate와-crontab을-활용한-docker-log-관리)
  - [🎁 목차](#-목차)
  - [개요](#개요)
  - [Logrotate + Crontab](#logrotate--crontab)
    - [1. logrotate.conf](#1-logrotateconf)
    - [2. logrotate 작성 가이드](#2-logrotate-작성-가이드)
    - [3. logrotate 작성](#3-logrotate-작성)
    - [4. docker-logrotate script 작성](#4-docker-logrotate-script-작성)
    - [5. logrotate test](#5-logrotate-test)
    - [6. crontab apply](#6-crontab-apply)
  - [Yaml에서 log관리](#yaml에서-log관리)

## 개요
우리가 `docker logs $CONTAINER_NAME`으로 볼 수 있는 log들은 *.log형태로 저장된 파일이다.
  - `/var/lib/docker/containers/$CONTAINER_ID/$CONTAINER_ID.json.log`
  - 이 파일의 크기는 container에서 발생하는 로그가 있을때마다 늘어난다.

Disk full을 방지하기 위한 방법은 여러가지가 있다.
  1. `docker-compose down && docker-compose up`
     - docker-compose down에는 docker rm이 포함된다.
     - container가 remove되면 `/var/lib/docker/container/`경로의 해당 container 폴더가 사라진다.
  2. 주기적으로 경로에 들어가서 *.log파일 삭제
  3. Logrotate + crontab
  4. `docker-compose.yaml` 설정

각 방법들은 다음과 같은 특징이 있다.
  - 1번 : volume을 설정해주지 않으면 관련 data도 같이 사라진다. (x)
  - 2번 : 불편하다..(x)
  - 3번 : 편하다.
  - 4번 : 편하다. 다만 기능이 한정적이다.

**본 문서에서는 3번과 4번을 기술한다.!!**

## Logrotate + Crontab
Ubuntu 18.04에서는 logrotate가 설치되어 있다
### 1. logrotate.conf
파일의 위치: `/etc/logrotate.conf`
- logrotate의 default 설정이 명시되어 있다.
- include /etc/logrotate.d
  - 해당 directory 속 파일들을 include하는 구문이다.

### 2. logrotate 작성 가이드
|옵션|설명|예시|
|:-:|:-:|:-:|
|rotate [숫자]|log파일이 [숫자]개 이상이면 삭제|rotate 5|
|maxage [숫자]|log파일이 [숫자]일 이상이면 삭제|maxage 30|
|size|지정된 용량보다 클 경우 로테이트 실행|size +100k|
|create [권한][유저][그룹]|로테이트 되는 log파일 권한 지정|create 644 root root|
|notifempty|로그 내용이 없으면 로테이트 하지 않음||
|ifempty|로그 내용이 없어도 로테이트||
|monthly|월 단위 로테이트 진행||
|weekly|주 단위 로테이트 진행||
|daily|일 단위 로테이트 진행||
|compress|로테이트 되는 log파일 압축||
|nocompress|로테이트 되는 log파일 압축 하지 않음||
|missingok|log파일이 발견되지 않은 경우 에러처리 하지 않음||
|dateext|백업파일의 이름에 날짜가 들어가도록 함||
|copytruncate|복사본을 만들고 크기를 0으로||
|lastaction-endscript|logrotate output을 생성하고 실행|lastaction<br>---<br>endscript|

### 3. logrotate 작성
logrotate가 실행할 파일을 작성한다.
- logrotate file의 주요 설정은 다음과 같다.
  - 매일 생성
  - gz으로 압축
  - 압축파일에 날짜를 명시
  - 수행 완료 후 `/data/log/logrotate/docker-logrotate.sh`실행
```sh
cd /data/log/logrotate
vim docker
```

```
/var/lib/docker/containers/*/*.log {
  rotate 100
  daily
  compress
  ifempty
  missingok
  copytruncate
  create
  dateext
  lastaction
    /data/log/logrotate/docker-logrotate.sh
  endscript
}
```

### 4. docker-logrotate script 작성
logrotate작업 후 실행할 `docker-logrotate.sh`을 작성한다.
- `docker-logrotate.sh`의 용도
  - logrotate가 생성한 파일(*.gz)을 별도 경로(`/data/log`)로 이동한다.
```sh
# docker-logrotate.sh

#!/bin/bash

ARRAY=($(ls /var/lib/docker/containers/*/*.gz))

for file in ${ARRAY[@]}; do
  FILE=${file##*/}
  CONTAINER_ID=$(echo $FILE | awk -F'-' '{print $1}')
  DIRECTORY_NAME=$(docker ps -a -f ID=$CONTAINER_ID --format "{{.Names}}")

  mkdir -p /data/log/$DIRECTORY_NAME
  mv /var/lib/docker/containers/$CONTAINER_ID/$FILE /data/log/$DIRECTORY_NAME
done
```

### 5. logrotate test
```sh
# logrotate 적용
sudo /usr/sbin/logrotate -f /data/log/logrotate/docker

# log 확인
vim /var/lib/logrotate/status

# cron log 확인
# sudo grep -i cron /var/log/syslog
```

### 6. crontab apply
- crontab manual
```sh
crontab [ -u user ] [ -i ] { -e | -l | -r }
  -e (edit user's crontab)   # 예약 작업 추가 
  -l (list user's crontab)  # 예약 작업 리스트 확인 
  -r (delete user's crontab) # 예약 작업 삭제 
  -i (prompt before deleting user's crontab)
```
- crontab apply
  - 다음 설정은 매일 0시 00분에 `command`를 실행하는 설정이다.
  - crontab은 슈퍼권한과 그렇지 않은것으로 구분된다. 권한을 확인하자.
```sh
# 등록
sudo crontab -e
############################################################
# 다음을 입력
#
# *　　　 　*　　　　　*　　 　　*　　　　*
# 분(0-59) 시간(0-23) 일(1-31) 월(1-12) 요일(0-7)
0 0 * * * /usr/sbin/logrotate -f /data/log/logrotate/docker
#
#
############################################################
# 확인
sudo crontab -l
```
- check
  - crontab이 정상적으로 동작하지 않을때나, syslog가 제대로 찍히지 않을 때 다음을 실행한다.
```sh
# crontab 재시작
sudo service cron restart

# syslog 재시작
sudo service rsyslog restart
```
- optional
  - crontab -e를 이용하여 logrotate 말고도 다양한 command를 적용할 수 있다.
```sh
# crontab example

# 7일 전 파일 삭제
0 0 * * * find . -mtime +6 -type f -delete
```

## Yaml에서 log관리
`docker-compose.yaml`에서도 로그관리를 할 수 있다.
다만, logrotate처럼 세부설정은 불가하다.
```yaml
# example

version: "2"
networks:
  test:

services:
  servicename:    
    logging:
      driver: "json-file"
      options:
        max-size: "10m"
        max-file: "10"
```