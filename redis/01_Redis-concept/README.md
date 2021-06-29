# Redis concept

## 🎁 목차
- [Redis concept](#redis-concept)
  - [🎁 목차](#-목차)
  - [개요](#개요)
  - [Stand alone](#stand-alone)
  - [Sentinel](#sentinel)
  - [Cluster](#cluster)

## 개요
Redis(Remote Dictionary Server)는 key-value구조의 NoSQL DB이다.
메모리 기반 DBMS로 key-value DBMS 중 가장 인기있다.

Redis의 모드는 크게 3가지로 나뉜다.
- Stand alone
- Sentinel
- Cluster

주요 특징은 다음과 같다.
- 다양한 데이터 구조를 지원한다.
  - Key-value, Hash, Set, List, SortedSet
- Expireation
  - Key 별로 TTL(Time-To-Live)을 설정해두면 redis가 알아서 해당 시점이 지날 때 key를 삭제한다.
- Pipelining
  - 여러 command들을 모아서 보낸 후 한번에 모아서 받을 수 있다.
- Pub/Sub
  - 하나의 client가 같은 채널에 연결된 다른 client들에게 메시지를 보낼 수 있다.

## Stand alone
하나의 인스턴스만을 가동한다.
따라서 HA(High availibilty) 즉, 고가용성을 지원하지 않는다.
테스트 용도로만 사용하고 실 운영환경에는 지양하는 것이 좋다.

## Sentinel
- Redis replication과 별도의 sentinel instance가 필요하다.
- Sentinel은 redis master가 작동 안되면 slave 중 하나를 마스터로 자동 승격한다.
- Client는 redis instance와 항상 연결되어 있지만 연결 할 redis instance를 찾기위해서는 redis sentinel에게 요청해야한다.
- Sentinel instance는 최소 3개 이상의 홀수개가 필요하다.(zookeeper 운영방식과 동일)
- 데이터 유실의 경우
  - master: 1, slave: 2의 상황
  - network 장애로 master가 slave들과 분리되어짐.
  - slave 중 하나가 master로 승격.
  - 네트워크 장애 복구 시, master가 2개가 되고, 이 둘은 동기화가 되지 않음.
  - 장애 간 모든 write작업 유실

## Cluster
- HA와 sharding을 지원한다.
- Sharding이란 데이터를 다수의 데이터베이스에 분산하여 저장하는 방법이다.
- 2개의 포트르 사용한다.(Client 용, 노드 간 통신 용)
- 안정적 운영을 위해서는 최소 3개의 Master가 필요하다.
- Fail over 발생 시 slave 승격이 즉각적으로 일어나지 않아 데이터를 사용 못할수도 있다.
- Client는 cluster 내 아무 노드에게나 쿼리를 날려도 된다.
  - 해당 노드가 해당 쿼리의 키를 가지고 있다면 바로 리턴한다.
  - 그렇지 않은 경우 해당 키를 저장하고 있는 노드의 정보를 리턴한다.
  - Client는 전달받은 노드의 정보로 다시 쿼리를 보낸다.