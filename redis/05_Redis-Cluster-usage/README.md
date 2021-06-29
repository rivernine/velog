# Redis Cluster usage

## 🎁 목차
- [Redis Cluster usage](#redis-cluster-usage)
  - [🎁 목차](#-목차)
  - [개요](#개요)
  - [1. Start cluster](#1-start-cluster)
    - [1.1. cluster table](#11-cluster-table)
    - [1.2. cluster info](#12-cluster-info)
  - [2. Get/Set data](#2-getset-data)
    - [2.1. `redis-cli -p $PORT`](#21-redis-cli--p-port)
    - [2.2. `redis-cli -c -p $PORT`](#22-redis-cli--c--p-port)
  - [3. Add node](#3-add-node)
    - [3.1. start new node](#31-start-new-node)
    - [3.2. add node](#32-add-node)
    - [3.3. check](#33-check)
    - [3.4. reshard](#34-reshard)
  - [4. Redis-cli](#4-redis-cli)

## 개요
앞에서 Redis cluster를 구성해보았다.
Redis cluster구성의 정보가 필요하다면 [다음 링크](https://velog.io/@rivernine/redis-cluster-x-docker)를 참고하면 된다.
본 장에서는 실제 데이터의 저장과 노드 추가, 장애 시뮬레이션 등을 알아볼 것이다.

## 1. Start cluster
테스트를 위해 3개의 master로 이루어진 cluster를 구성하였다.
### 1.1. cluster table
|node|container|port|
|:-:|:-:|:-:|
|1|redis-master-1|7001|
|2|redis-master-2|7002|
|3|redis-master-3|7003|

### 1.2. cluster info
```sh
$ docker exec -it redis-master-1 bash
$ redis-cli -p 7001
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
cluster_stats_messages_ping_sent:87
cluster_stats_messages_pong_sent:92
cluster_stats_messages_sent:179
cluster_stats_messages_ping_received:90
cluster_stats_messages_pong_received:87
cluster_stats_messages_meet_received:2
cluster_stats_messages_received:179

127.0.0.1:7001> cluster nodes
027a002ecc012b61a5997f151ad01bccbb65d1c0 127.0.0.1:7001@17001 myself,master - 0 1624260271000 1 connected 0-5460
3c349984f0bb61490c170ab68f2617a35d9581d6 127.0.0.1:7003@17003 master - 0 1624260271040 3 connected 10923-16383
79816979a6dd4b226e476121dd385ed6c25e5151 127.0.0.1:7002@17002 master - 0 1624260272044 2 connected 5461-10922
```

## 2. Get/Set data
redis는 `set $KEY $VALUE`로 데이터를 삽입하고, `get $KEY`를 통해 데이터를 가져온다.

### 2.1. `redis-cli -p $PORT`
먼저 `redis-cli`로 접근을 한다.
7001번 포트로 접속을 하면 7001번이 아닌 다른 포트에 access를 할 때에 `error`가 발생한다.
```sh
root@ubuntu:/data$ redis-cli -p 7001
127.0.0.1:7001> set a b
(error) MOVED 15495 127.0.0.1:7003
127.0.0.1:7001> get a
(error) MOVED 15495 127.0.0.1:7003
127.0.0.1:7001> get a
(error) MOVED 15495 127.0.0.1:7003
127.0.0.1:7001> get a
(error) MOVED 15495 127.0.0.1:7003
127.0.0.1:7001> set b c
OK
127.0.0.1:7001> get b
"c"
127.0.0.1:7001> exit
```

### 2.2. `redis-cli -c -p $PORT`
`-c`옵션은 redis를 cluster모드로 접속하게 해준다.
위와는 다르게 해당하는 hash slot을 가진 주소로 **redirect**를 해준다.
```sh
root@ubuntu:/data$ redis-cli -c -p 7001
127.0.0.1:7001> set a b
-> Redirected to slot [15495] located at 127.0.0.1:7003
OK
127.0.0.1:7003> get a
"b"
127.0.0.1:7003> set b c
-> Redirected to slot [3300] located at 127.0.0.1:7001
OK
127.0.0.1:7001> get b
"c"
127.0.0.1:7001> set c d
-> Redirected to slot [7365] located at 127.0.0.1:7002
OK
127.0.0.1:7002> get c
"d"
127.0.0.1:7002> get d
-> Redirected to slot [11298] located at 127.0.0.1:7003
(nil)
127.0.0.1:7003>
```
- `redis-cli -c -p 7001`
  - 7001번 포트에 서비스되고 있는 cluster node에 접속한다.
- `127.0.0.1:7001> set a b`
  - 7001번 노드에서 key:value를 저장한다. (a:b)
- `-> Redirected to slot [15495] located at 127.0.0.1:7003`
  - a라는 key를 `CRC16(key) mod 16384`를 통해 hashing하고, 해당하는 hash slot에 redirect 한다.
  - `CRC16(a) mod 16384`는 15495로 7003노드가 가지고 있는 hash slot이다.
  - 따라서 7003노드로 redirect하는 과정이다.
- `127.0.0.1:7003> get a`
  - 이후 7003노드에서 실행되며 해당 key의 value를 가져온다.

## 3. Add node
이미 구성되어 있는 cluster에 노드를 추가하는 방법을 알아보자.
### 3.1. start new node
`redis-7004.yaml`이라는 파일을 생성하고 시작한다.
포트를 제외한 모든 설정은 기존 노드들과 같다.
```sh
$ docker-compose -f redis-7004.yaml up -d
Creating redis-master-4 ... done

$ docker ps -a | grep redis
91f1d77161a7        redis:6.2.3         "docker-entrypoint.s…"   34 seconds ago      Up 32 seconds                                  redis-master-4
0706f949061d        redis:6.2.3         "docker-entrypoint.s…"   18 minutes ago      Up 18 minutes                                  redis-master-3
de5e52fb0428        redis:6.2.3         "docker-entrypoint.s…"   18 minutes ago      Up 9 minutes                                   redis-master-2
8a4cde915a47        redis:6.2.3         "docker-entrypoint.s…"   18 minutes ago      Up 18 minutes                                  redis-master-1
```

### 3.2. add node
cluster에 새로 띄워진 노드를 추가한다.
```sh
$ docker exec -it redis-master-1 bash
$ redis-cli -p 7001 --cluster add-node 127.0.0.1:7004 127.0.0.1:7001
>>> Adding node 127.0.0.1:7004 to cluster 127.0.0.1:7001
>>> Performing Cluster Check (using node 127.0.0.1:7001)
M: 027a002ecc012b61a5997f151ad01bccbb65d1c0 127.0.0.1:7001
   slots:[0-5460] (5461 slots) master
M: 3c349984f0bb61490c170ab68f2617a35d9581d6 127.0.0.1:7003
   slots:[10923-16383] (5461 slots) master
M: 79816979a6dd4b226e476121dd385ed6c25e5151 127.0.0.1:7002
   slots:[5461-10922] (5462 slots) master
[OK] All nodes agree about slots configuration.
>>> Check for open slots...
>>> Check slots coverage...
[OK] All 16384 slots covered.
>>> Send CLUSTER MEET to node 127.0.0.1:7004 to make it join the cluster.
[OK] New node added correctly.
```
- `redis-cli -p port --cluster add-node 추가할노드 작업할노드`
  - "추가할노드"에 신규 노드를 입력한다.

### 3.3. check
```sh
127.0.0.1:7001> cluster info
cluster_state:ok
cluster_slots_assigned:16384
cluster_slots_ok:16384
cluster_slots_pfail:0
cluster_slots_fail:0
cluster_known_nodes:4
cluster_size:3
cluster_current_epoch:3
```
- `cluster_size:3`
  - 노드는 추가되었지만 hash slot이 할당되지 않아 size는 그대로이다.

```sh
127.0.0.1:7001> cluster nodes
2bc7574b8d23ec967260fb822cccad471e3cecfa 127.0.0.1:7004@17004 master - 0 1624261424857 0 connected
027a002ecc012b61a5997f151ad01bccbb65d1c0 127.0.0.1:7001@17001 myself,master - 0 1624261425000 1 connected 0-5460
3c349984f0bb61490c170ab68f2617a35d9581d6 127.0.0.1:7003@17003 master - 0 1624261425863 3 connected 10923-16383
79816979a6dd4b226e476121dd385ed6c25e5151 127.0.0.1:7002@17002 master - 0 1624261424000 2 connected 5461-10922
```
- 마찬가지로 7004노드에 hash slot이 표시되어있지 않음.

### 3.4. reshard
신규 노드는 기존 노드의 hash slot을 나누어 가질 수 있다.
`reshard`를 통해 나누어가질 hash slot을 정할 수 있고, 
`rebalance`를 통해 hash slot을 균등하게 배분할 수도 있다.

## 4. Redis-cli
redis-cli의 옵션은 다음과 같다.
- `create`
  - 클러스터를 생성한다.
  - replicas를 지정하여 slave개수를 지정할 수 있음.
- `reshard`
  - 슬롯을 노드에 할당/재할당한다.
- `moveslots`
  - 슬롯을 지정하여 이동한다.
- `add-node`
  - 클러스터에 노드를 추가한다.
  - master/slave로 추가할 수 있음
- `del-node`
  - 클러스터에서 노드를 제거한다.
- `info`
  - 클러스터 정보를 조회한다.
- `rebalance`
  - 슬롯을 균형있게 재분배한다.
- `check`
  - 클러스터를 체크한다.
- `call`  
  - 클러스터 노드에 명령을 실행한다.
- `set-timeout`
  - 클러스터 노드에 `cluster-node-timeout`을 설정한다.
- `help`
  - 도움말을 보여준다.
- [참고 링크](http://redisgate.kr/redis/cluster/redis-cli-cluster.php)

