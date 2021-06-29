# Redis cluster (2)

## 🎁 목차
- [Redis cluster (2)](#redis-cluster-2)
  - [🎁 목차](#-목차)
  - [개요](#개요)
  - [1. Configuration information](#1-configuration-information)
    - [1.1. server table](#11-server-table)
  - [2. Start cluster](#2-start-cluster)
    - [2.1. create cluster](#21-create-cluster)
    - [2.2. check](#22-check)
  - [3. Trouble shooting](#3-trouble-shooting)
    - [3.1. docker host network](#31-docker-host-network)
    - [3.2. `redis.conf`](#32-redisconf)
    - [3.3 Firewall](#33-firewall)

## 개요
[**Redis cluster (1)**](https://velog.io/@rivernine/Redis-cluster-1)과 이어지는 내용이다.
Redis cluster에 slave node를 추가해보자.
Slave node는 master node의 복제본이고, master node에서 장애 발생 시 master로 승격한다.
이상적인 HA를 위해 동일 정보를 저장하고있는 master와 slave는 다른 서버에 분리시켜 놓는 것이 좋다.

## 1. Configuration information
### 1.1. server table
|이름|주소|클러스터|
|:-:|:-:|:-:|
|node1|192.168.56.100|redis-master-1, redis-slave-3|
|node2|192.168.56.101|redis-master-2, redis-slave-1|
|node3|192.168.56.102|redis-master-3, redis-slave-2|

- 하나의 마스터에 하나의 복제본을 생성한다.
  - ||master|slave|
    |:-:|:-:|:-:|
    |1|redis-master-1|redis-slave-1|
    |2|redis-master-2|redis-slave-2|
    |3|redis-master-3|redis-slave-3|
  - 위에서 설명한 바와 같이 master, slave쌍을 분리시켜 놓는다.
  - 분리시켜놓지 않으면 하나의 서버만 죽어도 cluster가 작동하지 않는다.

## 2. Start cluster
### 2.1. create cluster
`--cluster-replicas`를 1로 설정하여 하나의 master당 하나의 slave로 구성한다.
master는 앞에서 부터 차례대로 할당되며 할당이 끝난 후 slave도 차례대로 master에 매핑된다.

```sh
$ docker exec -it redis-master-1 bash
$ redis-cli --cluster create 192.168.56.100:7001 192.168.56.101:7001 192.168.56.102:7001 192.168.56.100:7002 192.168.56.101:7002 192.168.56.102:7002 --cluster-replicas 1
>>> Performing hash slots allocation on 6 nodes...
Master[0] -> Slots 0 - 5460
Master[1] -> Slots 5461 - 10922
Master[2] -> Slots 10923 - 16383
Adding replica 192.168.56.101:7002 to 192.168.56.100:7001
Adding replica 192.168.56.102:7002 to 192.168.56.101:7001
Adding replica 192.168.56.100:7002 to 192.168.56.102:7001
M: 5b56d458a0d8e64d5f40ece0a99713dcb9c70723 192.168.56.100:7001
   slots:[0-5460] (5461 slots) master
M: c952f5ef4783b5c19129bc630b88e8e3bf602622 192.168.56.101:7001
   slots:[5461-10922] (5462 slots) master
M: 22110f4ea10f11a8cb6ea283dedfc27c6ffabc07 192.168.56.102:7001
   slots:[10923-16383] (5461 slots) master
S: 30a99d668af3ddda16e2a9d3ee97fb53a5ebfa6d 192.168.56.100:7002
   replicates 22110f4ea10f11a8cb6ea283dedfc27c6ffabc07
S: e0d9ee09b593889cd093d217a16a0b535e6abef2 192.168.56.101:7002
   replicates 5b56d458a0d8e64d5f40ece0a99713dcb9c70723
S: 094af2ab1db0d147d7f475f3954429ae7d18dee0 192.168.56.102:7002
   replicates c952f5ef4783b5c19129bc630b88e8e3bf602622
Can I set the above configuration? (type 'yes' to accept): yes
>>> Nodes configuration updated
>>> Assign a different config epoch to each node
>>> Sending CLUSTER MEET messages to join the cluster
Waiting for the cluster to join
.
>>> Performing Cluster Check (using node 192.168.56.100:7001)
M: 5b56d458a0d8e64d5f40ece0a99713dcb9c70723 192.168.56.100:7001
   slots:[0-5460] (5461 slots) master
   1 additional replica(s)
S: e0d9ee09b593889cd093d217a16a0b535e6abef2 192.168.56.101:7002
   slots: (0 slots) slave
   replicates 5b56d458a0d8e64d5f40ece0a99713dcb9c70723
S: 30a99d668af3ddda16e2a9d3ee97fb53a5ebfa6d 192.168.56.100:7002
   slots: (0 slots) slave
   replicates 22110f4ea10f11a8cb6ea283dedfc27c6ffabc07
M: 22110f4ea10f11a8cb6ea283dedfc27c6ffabc07 192.168.56.102:7001
   slots:[10923-16383] (5461 slots) master
   1 additional replica(s)
M: c952f5ef4783b5c19129bc630b88e8e3bf602622 192.168.56.101:7001
   slots:[5461-10922] (5462 slots) master
   1 additional replica(s)
S: 094af2ab1db0d147d7f475f3954429ae7d18dee0 192.168.56.102:7002
   slots: (0 slots) slave
   replicates c952f5ef4783b5c19129bc630b88e8e3bf602622
[OK] All nodes agree about slots configuration.
>>> Check for open slots...
>>> Check slots coverage...
[OK] All 16384 slots covered.
```
- `redis-cli --cluster create $MASTER_1 ... $MASTER_N $SLAVE_1 ... $SLAVE_N --cluster-replicas 1`
  - `--cluster-replicas`만큼 복제본을 가진 cluster를 생성한다.


### 2.2. check
```sh
$ redis-cli -c -p 7001
127.0.0.1:7001> cluster info
cluster_state:ok
cluster_slots_assigned:16384
cluster_slots_ok:16384
cluster_slots_pfail:0
cluster_slots_fail:0
cluster_known_nodes:6
cluster_size:3
cluster_current_epoch:6
cluster_my_epoch:1
cluster_stats_messages_ping_sent:800
cluster_stats_messages_pong_sent:810
cluster_stats_messages_sent:1610
cluster_stats_messages_ping_received:805
cluster_stats_messages_pong_received:800
cluster_stats_messages_meet_received:5
cluster_stats_messages_received:1610

127.0.0.1:7001> cluster nodes
e0d9ee09b593889cd093d217a16a0b535e6abef2 192.168.56.101:7002@17002 slave 5b56d458a0d8e64d5f40ece0a99713dcb9c70723 0 1624430604104 1 connected
30a99d668af3ddda16e2a9d3ee97fb53a5ebfa6d 192.168.56.100:7002@17002 slave 22110f4ea10f11a8cb6ea283dedfc27c6ffabc07 0 1624430604000 3 connected
22110f4ea10f11a8cb6ea283dedfc27c6ffabc07 192.168.56.102:7001@17001 master - 0 1624430604000 3 connected 10923-16383
c952f5ef4783b5c19129bc630b88e8e3bf602622 192.168.56.101:7001@17001 master - 0 1624430604306 2 connected 5461-10922
094af2ab1db0d147d7f475f3954429ae7d18dee0 192.168.56.102:7002@17002 slave c952f5ef4783b5c19129bc630b88e8e3bf602622 0 1624430603000 2 connected
5b56d458a0d8e64d5f40ece0a99713dcb9c70723 192.168.56.100:7001@17001 myself,master - 0 1624430603000 1 connected 0-5460
```
- `cluster_size:3`
  - cluster를 구성하는 개수
  - slave를 제외한 master의 총 개수
- `cluster_known_nodes`
  - cluster에서 master, slave를 포함한 총 노드 수

## 3. Trouble shooting
redis가 통신이 되지 않을 때 다음을 확인해본다.
1. docker container가 host network를 사용해야한다.
2. `redis.conf`에서 `cluster-config-file`설정이 가리키는 파일은 node 별 하나씩 존재해야 한다.
3. 방화벽을 확인한다.

### 3.1. docker host network
docker-compose를 사용할 경우, `docker-compose.yaml`에 다음을 추가한다.
```yaml
network_mode: "host"   
```

### 3.2. `redis.conf`
node의 환경 설정을 셋팅하는 파일이다.
여기에 `cluster-config-file`을 통해 설정되어진 config정보를 저장할 파일명을 기입한다.
만에하나 docker volume mount를 통해 정보를 저장할 파일 명이 겹치게 되면 오류가 발생한다.

### 3.3 Firewall
Linux의 경우 흔히 발생하는 문제이다.
방화벽을 끌수도 있지만 보안을 위해 다음을 권장한다.

1. 방화벽 확인
```sh
$ sudo firewall-cmd --list-all --permanent --zone=public
```

2. 포트 허용
```sh
$ sudo firewall-cmd --permanent --add-port=7051/tcp --zone=public
$ sudo firewall-cmd --permanent --add-port=17051/tcp --zone=public
$ sudo firewall-cmd --permanent --add-port=7052/tcp --zone=public
$ sudo firewall-cmd --permanent --add-port=17052/tcp --zone=public
```

3. 변경사항 적용
```sh
$ sudo firewall-cmd --reload
```

4. 적용완료 확인
```sh
$ sudo firewall-cmd --list-all --permanent --zone=public
```

5. 기타
```sh
# 허용된 포트 제거
$ sudo firewall-cmd --permanent --remove-port=7001/tcp --zone=public
# 허용된 서비스 제거
$ sudo firewall-cmd --permanent --remove-service=http --zone=public
```