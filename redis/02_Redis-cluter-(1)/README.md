# Redis cluster (1)

## 🎁 목차
- [Redis cluster (1)](#redis-cluster-1)
  - [🎁 목차](#-목차)
  - [개요](#개요)
  - [1. Setup](#1-setup)
  - [2. Write `docker-compose.yaml`](#2-write-docker-composeyaml)
  - [3. Create `redis.conf`](#3-create-redisconf)
  - [4. Start cluster](#4-start-cluster)
    - [4.1. start](#41-start)
    - [4.2. create cluster](#42-create-cluster)
    - [4.3. check](#43-check)

## 개요
Redis cluster mode를 다룬다.
본문에서는 Redis cluster를 docker를 활용하여 서비스한다.

## 1. Setup
Redis cluster 권장 설정이다.
아래 설정을 해주지 않으면 `WARNING`이 발생한다.
```sh
# 메모리 사용량이 허용량을 초과할 경우, overcommit을 처리하는 방식 결정하는 값을 "항상"으로 변경
$ sudo sysctl vm.overcommit_memory=1
$ sudo echo "vm.overcommit_memory=1" >> /etc/sysctl.conf 
$ sudo sysctl -a | grep vm.overcommit

# 서버 소켓에 Accept를 대기하는 소켓 개수 파라미터를 변경
$ sudo sysctl -w net.core.somaxconn=1024
$ sudo echo "net.core.somaxconn=1024" >> /etc/sysctl.conf 
$ sudo sysctl -a | grep somaxconn

# THP(Transparent Huge Pages) 기능이 Enable 되어 있는 경우 Redis에서는 이를 Disable 시킬 것을 권장한다.
```

## 2. Write `docker-compose.yaml`
Redis는 docker network가 아닌 **host network를 사용**해야 한다.

```yaml
version: '3'
services:
  redis-master-1:
    container_name: redis-master-1
    image: redis:6.2.3
    network_mode: "host"   
    command: redis-server /etc/redis.conf   
    volumes: 
    - ./redis-master-1.conf:/etc/redis.conf
    restart: always
    ports:
    - 7001:7001
    - 17001:17001

  redis-master-2:
    container_name: redis-master-2
    image: redis:6.2.3
    network_mode: "host"     
    command: redis-server /etc/redis.conf 
    volumes:  
      - ./redis-master-2.conf:/etc/redis.conf
    restart: always
    ports:
      - 7002:7002
      - 17002:17002

  redis-master-3:
    container_name: redis-master-3
    image: redis:6.2.3
    network_mode: "host"      
    command: redis-server /etc/redis.conf
    volumes:  
      - ./redis-master-3.conf:/etc/redis.conf
    restart: always
    ports:
      - 7003:7003
      - 17003:17003
```
- `network_mode: "host"`
  - container가 host network를 사용할 수 있게한다.

## 3. Create `redis.conf`
cluster node가 사용할 `redis.conf`를 작성한다.

```conf
# redis-master-1.conf
port 7001
cluster-enabled yes
cluster-config-file nodes.conf
cluster-node-timeout 3000
appendonly yes

# redis-master-2.conf
port 7002
cluster-enabled yes
cluster-config-file nodes.conf
cluster-node-timeout 3000
appendonly yes

# redis-master-3.conf
port 7003
cluster-enabled yes
cluster-config-file nodes.conf
cluster-node-timeout 3000
appendonly yes
```
- `port $PORT`
  - node가 사용할 port를 지정한다.
  - cluster간 통신은 10000을 더한 port를 사용한다.

## 4. Start cluster
### 4.1. start
```sh
$ docker-compose up -d
```
- `docker-compose up -d`
  - 기본적으로 현재 경로의 `docker-compose.yaml`파일을 바라본다.
  - `-d`옵션은 컨테이너를 daemon형태로 실행한다.

### 4.2. create cluster
`redis-cli --cluster create ...`를 통해 클러스터를 구성한다.
출력되는 내용을 통해 node들에게 분배되는 hash slot을 확인할 수 있다.

```sh
$ docker exec -it redis-master-1 bash
$ redis-cli --cluster create 127.0.0.1:7001 127.0.0.1:7002 127.0.0.1:7003

>>> Performing hash slots allocation on 3 nodes...
Master[0] -> Slots 0 - 5460
Master[1] -> Slots 5461 - 10922
Master[2] -> Slots 10923 - 16383
M: 218ffd51a2d025a6af640bd9325db0de38750242 127.0.0.1:7001
   slots:[0-5460] (5461 slots) master
M: f1f6a1c8fea47794c07184ccb9b15c9ba31f2033 127.0.0.1:7002
   slots:[5461-10922] (5462 slots) master
M: 885bbe387799a7d1f724d2aa4bee267b14935823 127.0.0.1:7003
   slots:[10923-16383] (5461 slots) master
Can I set the above configuration? (type 'yes' to accept): yes
>>> Nodes configuration updated
>>> Assign a different config epoch to each node
>>> Sending CLUSTER MEET messages to join the cluster
Waiting for the cluster to join
.
>>> Performing Cluster Check (using node 127.0.0.1:7001)
M: 218ffd51a2d025a6af640bd9325db0de38750242 127.0.0.1:7001
   slots:[0-5460] (5461 slots) master
M: f1f6a1c8fea47794c07184ccb9b15c9ba31f2033 127.0.0.1:7002
   slots:[5461-10922] (5462 slots) master
M: 885bbe387799a7d1f724d2aa4bee267b14935823 127.0.0.1:7003
   slots:[10923-16383] (5461 slots) master
[OK] All nodes agree about slots configuration.
>>> Check for open slots...
>>> Check slots coverage...
[OK] All 16384 slots covered.
```
- `docker exec -it $CONTAINER_NAME bash` 
  - container내부로 진입한다.
- `redis-cli --cluster create $IP_1:$PORT_1 ... $IP_N:$PORT_N`
  - cluster를 구성한다.

### 4.3. check
cluster node에 접속하여 `cluster info`와 `cluster nodes`를 통해 클러스터의 정보 등을 확인할 수 있다.

```sh
$ redis-cli -c -p 7001
127.0.0.1:7001> cluster info
cluster_state:ok
cluster_slots_assigned:16384
cluster_slots_ok:16384
cluster_slots_pfail:0
cluster_slots_fail:0
cluster_known_nodes:3
cluster_size:3
cluster_current_epoch:3
cluster_my_epoch:1
cluster_stats_messages_ping_sent:107
cluster_stats_messages_pong_sent:111
cluster_stats_messages_sent:218
cluster_stats_messages_ping_received:109
cluster_stats_messages_pong_received:107
cluster_stats_messages_meet_received:2
cluster_stats_messages_received:218

127.0.0.1:7001> cluster nodes
f1f6a1c8fea47794c07184ccb9b15c9ba31f2033 127.0.0.1:7002@17002 master - 0 1624425301254 2 connected 5461-10922
885bbe387799a7d1f724d2aa4bee267b14935823 127.0.0.1:7003@17003 master - 0 1624425302260 3 connected 10923-16383
218ffd51a2d025a6af640bd9325db0de38750242 127.0.0.1:7001@17001 myself,master - 0 1624425301000 1 connected 0-5460
```
- `redis-cli -c -p 7001`
  - `-c`: cluster모드로 접속한다.
  - `-p`: 접속할 node의 포트
- `cluster info`
  - node 접속 후 실행하면 cluster들의 정보를 볼 수 있다.
- `cluster nodes`
  - node 연결 정보를 확인한다.