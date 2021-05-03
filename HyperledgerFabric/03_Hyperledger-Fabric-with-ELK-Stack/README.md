# Hyperledger Fabric with ELK Stack
## 🎁 Contents
- [Hyperledger Fabric with ELK Stack](#hyperledger-fabric-with-elk-stack)
  - [🎁 Contents](#-contents)
  - [0. Summary](#0-summary)
    - [0.1. Data Flow](#01-data-flow)
    - [0.2. 실습 환경](#02-실습-환경)
  - [1. Create Fabric network](#1-create-fabric-network)
  - [## 2.](#-2)
  
## 0. Summary
Fabric에서 발생하는 트랜잭션들을 필터링하여 ELK Stack에 저장해 보았다.
> **Elastic Search**는 데이터들을 인덱싱하여 빠른 검색을 도와준다.
향후 편의를 위한 단순 데이터 조회와 같은 기능은 ELK로 따로 분리할 수 있을 것 같다.
또한, Kibana를 통해 저장된 데이터들을 다양한 각도로 모니터링 할 수 있다는 장점을 가지고 있다.

### 0.1. Data Flow
```
Fabric Network      1. Block Commit
      |             
      |
      V
 EventListener      2. Block Log & Filtered Log 저장
      |
      |
      V
   Filebeat         3. Log파일의 변경을 확인하고 Logstash에게 전달
      |
      |
      V
   Logstash         4. Filebeat의 Output을 필터링 하여 Elaticsearch에게 전달
      |
      |
      V
Elasticsearch       5. 데이터를 저장
      |
      |
      V
    Kibana          6. 저장된 데이터들을 모니터링
```

### 0.2. 실습 환경
* Virtual Box 환경 구성
    |노드|OS|HOST|MEMORY|CPU|SERVICES|
    |:-:|:-:|:-:|:-:|:-:|:-:|       
    |Node 1|Ubuntu|192.168.56.10|4096 MB|2|ELK Stack( Elastic, Logstash, Kibana )
    |Node 2|Ubuntu|192.168.56.20|2048 MB|2|Fabric, Event Listener, File Beat
    
* 버전
    |이름|버전|
    |:-:|:-:|
    |Ubuntu|16.04.6 LTS|
    |Docker|18.09.6|
    |Docker-compose|1.23.2|
    |Fabric|1.4.0|
    |Elasticsearch|7.2.0|
    |Logstash|7.2.0|
    |Kibana|7.2.0|
    |Filebeat|7.2.0|

## 1. Create Fabric network
~~fabric version 1.4를 사용하였고, 과정은 생략한다.~~

## 2. 
---
**모든 소스는 [깃허브](https://github.com/rivernine/velog/tree/master/HyperledgerFabric)에 올려놓았다.**
