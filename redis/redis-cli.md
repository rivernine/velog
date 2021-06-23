# Redis-cli

## overview
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

## 참고
[링크](http://redisgate.kr/redis/cluster/redis-cli-cluster.php)