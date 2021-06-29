# Redis cluster (1)

## 🎁 목차
- [Redis cluster (1)](#redis-cluster-1)
  - [🎁 목차](#-목차)
  - [개요](#개요)
  - [1. Configuration information](#1-configuration-information)
    - [1.1. server table](#11-server-table)

## 개요
[**Redis cluster (1)**](https://velog.io/@rivernine/Redis-cluster-1)과 이어지는 내용이다.
Redis cluster에 slave node를 추가해보자.

## 1. Configuration information
### 1.1. server table
|이름|주소|클러스터|
|-|-|-|
|node1|192.168.56.100|redis-master-1, redis-slave-3|
|node2|192.168.56.101|redis-master-2, redis-slave-1|
|node3|192.168.56.102|redis-master-3, redis-slave-2|

- 하나의 서버에 master와 slave 각각 1개씩 둔다.
- 


1. create cluster
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

2. check
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