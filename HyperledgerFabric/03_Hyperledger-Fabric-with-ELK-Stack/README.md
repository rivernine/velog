# Hyperledger Fabric with ELK Stack
## 🎁 Contents
- [Hyperledger Fabric with ELK Stack](#hyperledger-fabric-with-elk-stack)
  - [🎁 Contents](#-contents)
  - [0. Summary](#0-summary)
    - [0.1. Data Flow](#01-data-flow)
    - [0.2. 실습 환경](#02-실습-환경)
  - [1. ~~Create Fabric network~~](#1-create-fabric-network)
  - [2. Customize EventListener](#2-customize-eventlistener)
    - [2.1. Edit `eventsclient.go`](#21-edit-eventsclientgo)
    - [2.2. FABRIC_CFG_PATH 설정](#22-fabric_cfg_path-설정)
  - [3. Dockerizing EventListener](#3-dockerizing-eventlistener)
    - [3.1. Create `docker-eventlistener.yaml`](#31-create-docker-eventlisteneryaml)
    - [3.2. Execute](#32-execute)
  - [4. ELK Stack](#4-elk-stack)
    - [4.1. Install ELK Stack](#41-install-elk-stack)
    - [4.2. Create ELK's `docker-compose.yaml`](#42-create-elks-docker-composeyaml)
    - [4.3. Execute ELK Stack](#43-execute-elk-stack)
    - [4.4. Edit ELK's configuration](#44-edit-elks-configuration)
  - [5. Filebeat](#5-filebeat)
    - [5.1. Install Filebeat](#51-install-filebeat)
    - [5.2. Write Filebeat Configuration](#52-write-filebeat-configuration)
    - [5.3. Filebeat to docker](#53-filebeat-to-docker)
    - [5.4. Run Filebeat](#54-run-filebeat)
  - [6. Check](#6-check)
  
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

## 1. ~~Create Fabric network~~
fabric version 1.4를 사용하였고, 과정은 생략한다.

## 2. Customize EventListener
### 2.1. Edit `eventsclient.go`
제공된 파일 `eventsclient.go`를 수정한다.
> 모든 소스는 하단 링크에 있다.

- ROOT 변수에 `configtx.yaml`의 파일 명 설정
```go
// eventsclient.go
const (
	OLDEST = -2
	NEWEST = -1

	ROOT = "configtx"
)
```

- readCLInputs() 변경
```go
// eventsclient.go
// 이벤트 수신 PEER 설정 host:port
//    +   /etc/hosts 파일에 PEER 추가

flag.StringVar(&serverAddr, "server", "peer0.org1.example.com:7051", "The RPC se
rver to connect to.")

// 이벤트 수신 CHANNEL 설정
flag.StringVar(&channelID, "channelID", "mychannel", "The channel ID to deliver 
from.")

// server.key, server.crt, ca.crt||ca.pem 경로 설정
flag.StringVar(&clientKeyPath, "clientKey", "/crypto-config/peerOrganizations/or
g1.example.com/peers/peer0.org1.example.com/tls/server.key", "Specify path to th
e client TLS key")
flag.StringVar(&clientCertPath, "clientCert", "/crypto-config/peerOrganizations/
org1.example.com/peers/peer0.org1.example.com/tls/server.crt", "Specify path to 
the client TLS certificate")
flag.StringVar(&serverRootCAPath, "rootCert", "/crypto-config/peerOrganizations/
org1.example.com/peers/peer0.org1.example.com/tls/ca.crt", "Specify path to the 
server root CA certificate")
```

- initMSP() 변경
```go
// eventclient.go
var mspMgrConfigDir = "/crypto-config/peerOrganizations/org1.example.com/users/Admin@org1.example.com/msp"
var mspID = "Org1MSP"
var mspType = "bccsp"
```

### 2.2. FABRIC_CFG_PATH 설정
```bash
export FABRIC_CFG_PATH=~/fabric-samples/first-network
```

위 까지 진행한 후 실행하면, PEER의 commit 발생 시 BLOCK 정보가 console에 나타난다.
BLOCK에서 사용하고자 하는 데이터를 추출해서 사용할 것이다. (write set)
> **saveFilteredLog()** : JSON Parsing function
위 메소드는 JSON을 Parsing하여 .log 파일로 저장한다.
본 글에서는 Docker를 이용하여 EventListener를 활성화 시킬 것이다.

## 3. Dockerizing EventListener
EventListener를 Docker container화 시키는 작업이다.
EventListener의 image는 `eventsclient.go`를 실행하기위한 환경 셋팅이 되어 있다.
### 3.1. Create `docker-eventlistener.yaml`
```sh
vim docker-eventlistener.yaml
```
```yaml
version: '2'

services:
  eventlistener:
    container_name: eventlistener
    image: eventlistener:1.0
    command: go run /eventsclient.go
    volumes:
      - ./crypto-config:/crypto-config
      - ./eventdir/log:/log
      - ./eventdir/eventsclient.go:/eventsclient.go
    extra_hosts:
      - peer0.org1.example.com:192.168.56.20
```

### 3.2. Execute
```sh
docker-compose -f ./docker-eventlistener.yaml up -d
docker logs -f eventlistener
```

다음과 같은 로그가 남는다.
```json
{
	"data": {
		"data": [
			{
				"payload": {
					"data": {
						"actions": [
							{
								...
								},
```
또한 docker-eventlistener.yaml에서 지정한 경로로 log파일 2개가 남는다.

```bash
cd $PATH/eventdir/log

ls
# blockhistory.log  filteredblockhistory.log
```

## 4. ELK Stack
ELK Stack을 활성화 시킨다.

### 4.1. Install ELK Stack
본 문서는 ELK Stack을 Docker로 실행한다.
```bash
# Native
wget https://artifacts.elastic.co/downloads/elasticsearch/elasticsearch-7.2.0-linux-x86_64.tar.gz
wget https://artifacts.elastic.co/downloads/logstash/logstash-7.2.0.tar.gz
wget https://artifacts.elastic.co/downloads/kibana/kibana-7.2.0-linux-x86_64.tar.gz
tar -zxvf elasticsearch-7.2.0-linux-x86_64.tar.gz
tar -zxvf logstash-7.2.0.tar.gz
tar -zxvf kibana-7.2.0-linux-x86_64.tar.gz

# Docker
docker pull docker.elastic.co/elasticsearch/elasticsearch:7.2.0
docker pull docker.elastic.co/logstash/logstash:7.2.0
docker pull docker.elastic.co/kibana/kibana:7.2.0
```

### 4.2. Create ELK's `docker-compose.yaml`
```yaml
version: '2.2'

services:
  elasticsearch01:
    image: docker.elastic.co/elasticsearch/elasticsearch:7.2.0
    container_name: elasticsearch01
    environment:
      - node.name=elasticsearch01
      - cluster.initial_master_nodes=elasticsearch01
    volumes:
      - ./elasticsearch/config/elasticsearch.yml:/usr/share/elasticsearch/config/elasticsearch.yml
      - ./elasticsearch/data/:/usr/share/elasticsearch/data
    ports:
      - 9200:9200

  kibana:
    image: docker.elastic.co/kibana/kibana:7.2.0
    container_name: kibana
    environment:
      SERVER_NAME: kibana.example.com
    volumes:
      - ./kibana/config/:/usr/share/kibana/config/
    ports:
      - 5601:5601
    depends_on:
      - elasticsearch01

  logstash:
    image: docker.elastic.co/logstash/logstash:7.2.0
    container_name: logstash
    volumes:
      - ./logstash/:/usr/share/logstash/
    command: ./bin/logstash -f /usr/share/logstash/config/logstash.conf
    ports:
      - 5044:5044
      - 9600:9600
    depends_on:
      - elasticsearch01
```

### 4.3. Execute ELK Stack
```sh
sudo sysctl vm.max_map_count=262144
docker-compose -f ./docker-compose.yaml up -d
```

### 4.4. Edit ELK's configuration
- elasticsearch.yml
```yaml
network.host: 0.0.0.0
http.port: 9200
```

- logstash.conf
```vim
input {
  beats {
    port => 5044
  }
  stdin { }
}

filter {
        json {
                source => "message"
                add_field => {
                        "%{key}" => "%{value}"
                }
        }
}

output {
  elasticsearch {
    hosts => ["192.168.56.10:9200"]
  }

  stdout {
    codec => rubydebug
  }
}
```

- kibana.yml
```yaml
server.port: 5601
server.host: "0.0.0.0"
elasticsearch.hosts: ["http://192.168.56.10:9200"]
```

## 5. Filebeat
ELK Stack과 Fabric, EventListener를 실행했다.
Event발생 시, 새로 작성되는 .log파일을 logstash에게 넘겨주는 매개체가 필요하다.
우리는 **Filebeat**를 사용하여 ELK Stack과 Fabric을 연결 시켜 줄 것이다.

```bash
Exception in thread "main" java.nio.file.AccessDeniedException
```
위와 같은 오류가 난다면 파일 권한을 확인!

### 5.1. Install Filebeat
```bash
docker pull docker.elastic.co/beats/filebeat:7.2.0
```

### 5.2. Write Filebeat Configuration
```bash
touch filebeat.yaml
vim filebeat.yml
```
```yaml
filebeat.inputs:
- type: log
  enabled: true
  paths:
    - /var/log/filteredblockhistory.log
  multiline.pattern: "{\"write\":\"generated\"}"
  multiline.negate: true
  multiline.match: after

filebeat.config:
  modules:
    path: ${path.config}/modules.d/*.yml
    reload.enabled: false

filebeat.autodiscover:
  providers:
    - type: docker
      hints.enabled: true

processors:
- add_cloud_metadata: ~

output.logstash:
  hosts: "192.168.56.10:5044"

```

### 5.3. Filebeat to docker
```bash
touch docker-filebeat.yaml
vim docker-filebeat.yaml
```
```yaml
version: '2.2'

services:
  filebeat:
    image: docker.elastic.co/beats/filebeat:7.2.0
    container_name: filebeat
    command: filebeat -e -strict.perms=false
    volumes:
      - ./filebeat.yml:/usr/share/filebeat/filebeat.yml
      - /var/run/docker.sock:/var/run/docker.sock
      - /home/jack2/fabric-samples/first-network/eventdir/log:/var/log
```

### 5.4. Run Filebeat
```bash
docker-compose -f docker-filebeat.yml up -d
```

## 6. Check
정리하자면, 예제(mycc)에서는 총 2개의 Key(a, b)가 변경된다.
Block의 Read/Write Set에는 다음과 같은 기록을 확인할 수 있다.
(value는 base64 encoded 되어있다.)

```json
"writes": [
	{
		"is_delete": false,
		"key": "a",
		"value": "OTA="
	},
	{
		"is_delete": false,
		"key": "b",
		"value": "MjEw"
	}
]
```
위 정보들이 Filtered 되어 filteredblockhistory.log로 저장된다.

```json
{"write":"generated"}
{"is_delete":"false","key":"a","value":"90"}
{"write":"generated"}
{"is_delete":"false","key":"b","value":"210"}
```

Log 파일은 Filebeat를 통해 Logstash로 전달되고, 최종적으로 Elasticsearch에 적재된다.

이제, 정상적으로 Elasticsearch에 저장되었는지 확인 할 것이다.
확인은 Kibana(Elasticsearch의 모니터링 툴)을 이용한다.
인터넷 브라우저에서 Kibana가 활성화 되어 있는 port로 접근하면 된다.
본 예제를 그대로 따라했다면 192.168.56.10:5601 을 통해 Kibana를 사용할 수 있다.

아래와 같이 총 2개의 Key에 대한 변경이 저장된 것을 확인 할 수 있다.

![](./kibana.jpg)

각각의 txn을 눌러 확인해 본다.

![](./kibana1.jpg)

![](./kibana2.jpg)

**Kibana의 사용법을 익힌다면 효과적으로 데이터를 모니터링, 관리 할 수 있다.**



---
**모든 소스는 [깃허브](https://github.com/rivernine/velog/tree/master/HyperledgerFabric)에 올려놓았다.**
