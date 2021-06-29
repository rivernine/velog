# Redis cluster

## 🎁 목차
- [Redis cluster](#redis-cluster)
  - [🎁 목차](#-목차)
  - [개요](#개요)
  - [포트](#포트)
  - [Sharding](#sharding)
  - [Master Slave mode](#master-slave-mode)
  - [Redis cluster와 async](#redis-cluster와-async)
  - [Redis cluster의 일관성 보장](#redis-cluster의-일관성-보장)
  - [Redis cluster config](#redis-cluster-config)
  - [redis-cli](#redis-cli)

## 개요
Cluster란 클라이언트에게 고가용성(HA)를 제공해 준다.
Redis cluster는 HA뿐만 아니라 Sharding(여러 서버에 데이터가 분산저장)을 동시 제공한다.
노드는 Master와 Slave로 구성되어있다.
Slave노드는 Master노드의 데이터를 복제하여 저장하고 있는 역할을 한다.
Master노드에서 장애 발생 시 Slave노드가 Master로 승격되며 **무중단서비스가 가능하다.**

## 포트
모든 Redis cluster node는 두 개의 TCP 포트가 열려 있어야 한다.
1. Client port
   - Client - Cluster 간 통신에 사용
2. Cluster bus port
   - 장애 감지, 구성 업데이트, 장애 조치 권한 부여 등에 사용
   - 노드 간 데이터 교환을 위해 이진 프로토콜을 사용한다.

## Sharding
Redis cluster에는 16384개의 Hash slot이 있으며 Redis cluster의 모든 노드는 이를 나누어 갖는다.
따라서 노드를 추가 및 제거할 때 Hash slot이 재 구성된다.
노드에서 다른 노드로 Hash slot을 이동할 때 작업을 중지 할 필요가 없다. 
**때문에 노드 추가 및 제거로 노드가 보유하는 Hash slot의 비율을 변경하는 데 다운 타임이 필요하지 않다.**

## Master Slave mode
Redis cluster는 sharding을 사용하여 데이터를 분산 저장한다.
때문에 cluster 중 하나에서 장애가 발생하면 해당 cluster의 hashslot은 사용하지 못한다.
이를 보완하기 위해 master node는 자신을 복제한 slave를 추가한다.
Master 노드에서 장애 발생 시 slave노드는 master로 승격한다.
Master와 slave 노드가 같은 서버에 존재하고, 해당 서버에 장애가 발생하여 동시 실패하면 redis cluster는 작동하지 않는다.

## Redis cluster와 async
Redis cluster는 비동기 복제를 사용한다.
1. Client가 Master B에게 write.
2. Master B가 Client에게 OK 송신.
3. Master B는 write set을 Slave(B1, B2, B3)들에게 전파.

Client에게 3번의 과정을 기다리는 것은 엄청난 지연 패널티이다.
따라서 redis cluster는 비동기 복제를 사용한다.

하지만 3의 과정에서 다음과 같은 장애가 발생한다면??
1. B1, B2는 Master B로 부터 write set을 전달받았다.
2. B3은 전달받지 못한 채로 네트워크에 장애가 발생한다.
3. B3이 Master로 승격한다.

**다음과 같은 장애 시나리오로 write의 손실이 발생한다.**

## Redis cluster의 일관성 보장
위와 같은 장애시나리오에 대한 솔루션으로 Redis는 **WAIT**을 사용한다.
async 복제를 사용하되 때에 따라서 sync write를 지원하는 것이다.
하지만, 이는 완벽한 일관성을 보장하지 않는다.
다음 장애 시나리오를 보자.

1. Master A, B, C와 Slave A1, B1, C1 존재
2. 네트워크 파티션 발생!!
3. A, C, A1, B1, C1은 파티션 한쪽에, B와 Client가 다른 쪽에 존재.
4. Client는 장애 상황을 모르고 계속 B에게 write.
5. 파티션의 양 쪽이 다름(write 유실)

이를 위해 redis cluster는 **Node time out**시간이 지나면 write를 불허한다...

## Redis cluster config
- `cluster-enabled<yes/no>`
  - default: `no`
  - Redis 인스턴스에서 cluster 활성화 여부
- `cluster-config-file<filename>`
  - cluster의 상태를 기록하는 바이너리 파일
- `cluster-node-timeout<milliseconds>`
  - cluster가 다운되었는지 판단하는 시간.
- `cluster-slave-validity-factor<factor>`
  - master와 slave 간 체크가 오랫동안 단절되면 해당 slave는 승격 대상에서 제외한다.
  - 이때, 승격 대상에서 제외하는 판단 기준의 시간을 설정
- `cluster-migration-barrier<count>`
  - default: `1`
  - master에 연결되어 있어야 하는 최소 slave 수
- `cluster-require-full-coverage<yes/no>`
  - cluster의 일부가 다운될 때 운영할 방법 설정
  - `yes`: slave가 없는 master가 다운되면 cluster 전체 중지
  - `no`: slave없는 master가 다운되어도 cluster 유지. 단, 해당 master slot에서 error 발생
  - 데이터 정합성이 중요하다면 `yes`선택
- `cluster-allow-reads-when-down<yes/no>`
  - `no`: 실패 상태 시 모든 트래픽 중지.
  - `yes`: 실패 상태 동안에도 노드에서 read 가능.
  
## redis-cli
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

