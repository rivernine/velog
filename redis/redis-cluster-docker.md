# Redis hands on

## 🎁 목차
- [Redis hands on](#redis-hands-on)
  - [🎁 목차](#-목차)
  - [개요](#개요)
  - [다운로드](#다운로드)
  
## 개요
본 장에서는 redis cluster를 docker환경에서 운영해 볼 것이다.
redis 버전은 6.2.3을 사용한다.

## 다운로드
1. Pull redis image 
```sh
$ docker pull redis:6.2.3
$ docker images | grep 'redis'
redis                              6.2.3              bc8d70f9ef6c        5 weeks ago         105MB
```

```sh
$ docker exec -it redis-master-1  bash
```

```sh
$ redis-cli -p 7001 --cluster create 127.0.0.1:7001 127.0.0.1:7002 127.0.0.1:7003
>>> Performing hash slots allocation on 3 nodes...
Master[0] -> Slots 0 - 5460
Master[1] -> Slots 5461 - 10922
Master[2] -> Slots 10923 - 16383
M: 027a002ecc012b61a5997f151ad01bccbb65d1c0 127.0.0.1:7001
   slots:[0-5460] (5461 slots) master
M: 79816979a6dd4b226e476121dd385ed6c25e5151 127.0.0.1:7002
   slots:[5461-10922] (5462 slots) master
M: 3c349984f0bb61490c170ab68f2617a35d9581d6 127.0.0.1:7003
   slots:[10923-16383] (5461 slots) master
Can I set the above configuration? (type 'yes' to accept): yes
>>> Nodes configuration updated
>>> Assign a different config epoch to each node
>>> Sending CLUSTER MEET messages to join the cluster
Waiting for the cluster to join
.
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
```

```sh
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

```

```sh
127.0.0.1:7001> cluster nodes
027a002ecc012b61a5997f151ad01bccbb65d1c0 127.0.0.1:7001@17001 myself,master - 0 1624260271000 1 connected 0-5460
3c349984f0bb61490c170ab68f2617a35d9581d6 127.0.0.1:7003@17003 master - 0 1624260271040 3 connected 10923-16383
79816979a6dd4b226e476121dd385ed6c25e5151 127.0.0.1:7002@17002 master - 0 1624260272044 2 connected 5461-10922

```

```sh
root@ubuntu:/data# redis-cli -p 7001
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

root@ubuntu:/data# redis-cli -c -p 7001
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

- node down
```sh
$ redis-cli -c -p 7002
127.0.0.1:7002> debug segfault
Error: Connection reset by peer
(0.86s)
```

```sh
1:M 21 Jun 2021 07:28:21.434 * FAIL message received from 3c349984f0bb61490c170ab68f2617a35d9581d6 about 79816979a6dd4b226e476121dd385ed6c25e5151
1:M 21 Jun 2021 07:28:21.435 # Cluster state changed: fail
```

```sh
$ redis-cli -c -p 7001
127.0.0.1:7001>
127.0.0.1:7001>
127.0.0.1:7001> set a b
(error) CLUSTERDOWN The cluster is down
127.0.0.1:7001> cluster info
cluster_state:fail
cluster_slots_assigned:16384
cluster_slots_ok:10922
cluster_slots_pfail:0
cluster_slots_fail:5462
cluster_known_nodes:3
cluster_size:3
cluster_current_epoch:3
cluster_my_epoch:1
cluster_stats_messages_ping_sent:435
cluster_stats_messages_pong_sent:461
cluster_stats_messages_sent:896
cluster_stats_messages_ping_received:459
cluster_stats_messages_pong_received:434
cluster_stats_messages_meet_received:2
cluster_stats_messages_fail_received:1
cluster_stats_messages_received:896
```

```sh
127.0.0.1:7001> cluster nodes
027a002ecc012b61a5997f151ad01bccbb65d1c0 127.0.0.1:7001@17001 myself,master - 0 1624260599000 1 connected 0-5460
3c349984f0bb61490c170ab68f2617a35d9581d6 127.0.0.1:7003@17003 master - 0 1624260599580 3 connected 10923-16383
79816979a6dd4b226e476121dd385ed6c25e5151 127.0.0.1:7002@17002 master,fail - 1624260495388 1624260493352 2 disconnected 5461-10922
```

```sh
$ docker restart redis-master-2
redis-master-2
$ docker ps | grep redis-master-2
de5e52fb0428        redis:6.2.3         "docker-entrypoint.s…"   9 minutes ago       Up 8 seconds                            redis-master-2
```

```sh
$ docker logs redis-master-2
1:M 21 Jun 2021 07:30:56.966 * Node configuration loaded, I'm 79816979a6dd4b226e476121dd385ed6c25e5151
```

```sh
127.0.0.1:7001> cluster nodes
027a002ecc012b61a5997f151ad01bccbb65d1c0 127.0.0.1:7001@17001 myself,master - 0 1624260765000 1 connected 0-5460
3c349984f0bb61490c170ab68f2617a35d9581d6 127.0.0.1:7003@17003 master - 0 1624260767224 3 connected 10923-16383
79816979a6dd4b226e476121dd385ed6c25e5151 127.0.0.1:7002@17002 master - 0 1624260766218 2 connected 5461-10922
```

```sh
127.0.0.1:7001> set a b
-> Redirected to slot [15495] located at 127.0.0.1:7003
OK
127.0.0.1:7003> get a
"b"
127.0.0.1:7003> set b c
-> Redirected to slot [3300] located at 127.0.0.1:7001
OK
127.0.0.1:7001> set c d
-> Redirected to slot [7365] located at 127.0.0.1:7002
OK
127.0.0.1:7002> get c
"d"
```

---
- add node
```sh
$ docker-compose -f redis-7004.yaml up -d
Creating redis-master-4 ... done

$ docker ps -a | grep redis
91f1d77161a7        redis:6.2.3         "docker-entrypoint.s…"   34 seconds ago      Up 32 seconds                                  redis-master-4
0706f949061d        redis:6.2.3         "docker-entrypoint.s…"   18 minutes ago      Up 18 minutes                                  redis-master-3
de5e52fb0428        redis:6.2.3         "docker-entrypoint.s…"   18 minutes ago      Up 9 minutes                                   redis-master-2
8a4cde915a47        redis:6.2.3         "docker-entrypoint.s…"   18 minutes ago      Up 18 minutes                                  redis-master-1
```


```sh
$ docker exec -it redis-master-1 bash
# redis-cli -p port --cluster add-node 추가할노드 작업할노드
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

```sh
127.0.0.1:7001> cluster info
cluster_state:ok
cluster_slots_assigned:16384
cluster_slots_ok:16384
cluster_slots_pfail:0
cluster_slots_fail:0
# 노드는 추가되었지만 hash slot이 할당되지 않아 size는 그대로이다.
cluster_known_nodes:4
cluster_size:3
cluster_current_epoch:3
```

```sh
127.0.0.1:7001> cluster nodes
# hash slot이 표시되어있지 않음.
2bc7574b8d23ec967260fb822cccad471e3cecfa 127.0.0.1:7004@17004 master - 0 1624261424857 0 connected
027a002ecc012b61a5997f151ad01bccbb65d1c0 127.0.0.1:7001@17001 myself,master - 0 1624261425000 1 connected 0-5460
3c349984f0bb61490c170ab68f2617a35d9581d6 127.0.0.1:7003@17003 master - 0 1624261425863 3 connected 10923-16383
79816979a6dd4b226e476121dd385ed6c25e5151 127.0.0.1:7002@17002 master - 0 1624261424000 2 connected 5461-10922
```