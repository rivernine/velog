# Hyperledger Fabric v2.2 네트워크 구축하기
## 🎁 목차
- [Hyperledger Fabric v2.2 네트워크 구축하기](#hyperledger-fabric-v22-네트워크-구축하기)
  - [🎁 목차](#-목차)
  - [0. 개요](#0-개요)
  - [1. 사전 준비](#1-사전-준비)
  - [2. Hyperledger Fabric v2.2 인스톨](#2-hyperledger-fabric-v22-인스톨)
  - [3. 테스트 네트워크 구축하기](#3-테스트-네트워크-구축하기)
    - [3-1. 네트워크 시작](#3-1-네트워크-시작)
    - [3-2. 채널 생성](#3-2-채널-생성)
    - [3-3. 체인코드 배포](#3-3-체인코드-배포)
    - [3-4. 체인코드 실행](#3-4-체인코드-실행)
    - [3-5. 마치며](#3-5-마치며)
  

## 0. 개요
> Hyperledger Fabric v2.2를 알아보자.<br>
> Linux 환경이 갖춰져 있다면 5분만에 블록체인 네트워크를 활성화 시킬 수 있다!!😆<br>
> 본 문서는 Linux환경에서 docker를 적극 활용한다.

- |OS|Memory|Disk|
  |:-:|:-:|:-:|
  |Ubuntu 18.04|2048MB|20GB|

## 1. 사전 준비
> Hyperledger Fabric의 블록체인 네트워크는 docker container를 활용하여 편리한
> 운영 관리가 가능하다.
> 또한 Fabric core는 Github에 오픈소스로 공개되어 있다.
> 자신의 OS에 git과 docker, docker-compose를 설치하여 사전 준비를 완료하자.

- Git 설치하기
```sh
sudo apt-get install git
```
- Docker 설치하기
```sh
# docker remove
sudo apt-get remove docker docker-engine docker.io

# docker install
sudo apt-get update && sudo apt-get install \
    apt-transport-https \
    ca-certificates \
    curl \
    software-properties-common

curl -fsSL https://download.docker.com/linux/ubuntu/gpg | sudo apt-key add -
sudo add-apt-repository \
"deb [arch=amd64] https://download.docker.com/linux/ubuntu \
$(lsb_release -cs) stable"
sudo apt-get update && sudo apt-get install docker-ce
sudo usermod -aG docker $USER

# docker-compose install
sudo curl -L https://github.com/docker/compose/releases/download/1.21.2/docker-compose-$(uname -s)-$(uname -m) -o /usr/local/bin/docker-compose
sudo chmod +x /usr/local/bin/docker-compose

# check
docker --version
docker-compose --version
```

## 2. Hyperledger Fabric v2.2 인스톨
> Fabric에서 제공하는 chaincode, shell script등 다양한 예시 코드와 binary, docker image 등을
> 얻기 위해 Fabric binaries를 다운받자.

- Fabric Binary 설치
```sh
# 현 위치에 fabric-samples 디렉토리가 생긴다.
curl -sSL https://bit.ly/2ysbOFE | bash -s -- 2.2.1 1.4.9

# Installed docker image 확인
docker images
```

## 3. 테스트 네트워크 구축하기
> Hyperledger Fabric은 잘 만들어진 Shell script를 제공한다.<br>
> 이를 이용하여 채널 생성, 체인코드 배포 등을 누구나 쉽게 할 수 있다.<br>

### 3-1. 네트워크 시작
```sh
cd fabric-samples/test-network
./network.sh up

# 확인
docker ps -a
```
- 2개의 peer와 1개의 orderer, cli(네트워크 핸들링을 위한 fabric 제공 tool) 컨테이너가 정상적으로 작동되는 것을 볼 수 있다. 
### 3-2. 채널 생성
```sh
./network.sh createChannel
```
- ORG간 상호작용을 위해 채널을 만든다.
### 3-3. 체인코드 배포
```sh
./network.sh deployCC -ccn basic -ccp ../asset-transfer-basic/chaincode-go \
-ccl go
```
- 흔히 말하는 스마트컨트랙트를 배포한다.
### 3-4. 체인코드 실행
- 환경변수 설정
```sh
export PATH=${PWD}/../bin:$PATH
export FABRIC_CFG_PATH=$PWD/../config/
export ORDERER_CA=${PWD}/organizations/ordererOrganizations/example.com/orderers/orderer.example.com/msp/tlscacerts/tlsca.example.com-cert.pem
# Org1 설정
export CORE_PEER_TLS_ENABLED=true
export CORE_PEER_LOCALMSPID="Org1MSP"
export CORE_PEER_TLS_ROOTCERT_FILE=${PWD}/organizations/peerOrganizations/org1.example.com/peers/peer0.org1.example.com/tls/ca.crt
export CORE_PEER_MSPCONFIGPATH=${PWD}/organizations/peerOrganizations/org1.example.com/users/Admin@org1.example.com/msp
export CORE_PEER_ADDRESS=localhost:7051
```
- Invoke
- 배포한 체인코드를 실행하여 블록체인에 write한다.
  Write를 위해서는 설정한 정책에 따라 peer의 서명이 필요하다.
```sh
peer chaincode invoke \
  -o localhost:7050 \
  --ordererTLSHostnameOverride orderer.example.com \
  --tls \
  --cafile $ORDERER_CA\
  -C mychannel \
  -n basic \
  --peerAddresses localhost:7051 \
  --tlsRootCertFiles ${PWD}/organizations/peerOrganizations/org1.example.com/peers/peer0.org1.example.com/tls/ca.crt \
  --peerAddresses localhost:9051 \
  --tlsRootCertFiles ${PWD}/organizations/peerOrganizations/org2.example.com/peers/peer0.org2.example.com/tls/ca.crt \
  -c '{"function":"InitLedger","Args":[]}'

# 다음이 나오면 성공
# -> INFO 001 Chaincode invoke successful. result: status:200
```
  

- Query
- 배포한 체인코드를 실행하여 블록체인의 정보를 read한다.
```sh
peer chaincode query -C mychannel -n basic -c '{"Args":["GetAllAssets"]}'

# 다음이 나오면 성공
# [
# {"ID": "asset1", "color": "blue", "size": 5, "owner": "Tomoko", "appraisedValue": 300},
# {"ID": "asset2", "color": "red", "size": 5, "owner": "Brad", "appraisedValue": 400},
# {"ID": "asset3", "color": "green", "size": 10, "owner": "Jin Soo", "appraisedValue": 500},
# {"ID": "asset4", "color": "yellow", "size": 10, "owner": "Max", "appraisedValue": 600},
# {"ID": "asset5", "color": "black", "size": 15, "owner": "Adriana", "appraisedValue": 700},
# {"ID": "asset6", "color": "white", "size": 15, "owner": "Michel", "appraisedValue": 800}
# ]
```
- 네트워크 종료
```sh
./network.sh down

# 확인
docker ps -a
```
### 3-5. 마치며
- 다음 문서에서는 쉘 스크립트가 아닌 직접 블록체인 네트워크를 구성해 볼 것이다.