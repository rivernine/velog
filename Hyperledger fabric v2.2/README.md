# Hyperledger Fabric v2.2
## 🎁 목차
- [Hyperledger Fabric v2.2](#hyperledger-fabric-v22)
  - [🎁 목차](#-목차)
  - [0. 개요](#0-개요)
  - [1. 사전 준비](#1-사전-준비)
  - [2. Hyperledger Fabric v2.2 인스톨](#2-hyperledger-fabric-v22-인스톨)
  - [3-1. 테스트 네트워크 구축하기 -1 (Shell script 이용)](#3-1-테스트-네트워크-구축하기--1-shell-script-이용)
    - [3-1-1. 네트워크 시작](#3-1-1-네트워크-시작)
    - [3-1-2. 채널 생성](#3-1-2-채널-생성)
    - [3-1-3. 체인코드 배포](#3-1-3-체인코드-배포)
    - [3-1-4. 체인코드 실행](#3-1-4-체인코드-실행)
  - [3-2. 테스트 네트워크 구축하기 -2 (수작업)](#3-2-테스트-네트워크-구축하기--2-수작업)
    - [3-2-1. 사전 준비](#3-2-1-사전-준비)
    - [3-2-2. Key 생성](#3-2-2-key-생성)
    - [3-2-3. Genesis 파일 생성](#3-2-3-genesis-파일-생성)
    - [3-2-4. 네트워크 시작](#3-2-4-네트워크-시작)
    - [3-2-5. 채널 생성](#3-2-5-채널-생성)
    - [3-2-6. 채널 조인](#3-2-6-채널-조인)
    - [3-2-7. 앵커피어 설정](#3-2-7-앵커피어-설정)

## 0. 개요
> Hyperledger Fabric v2.2 시작을 다룬다.<br>
> 본 문서는 Linux환경에서 docker를 통해 블록체인 네트워크를 활성화 시킨다.
- |OS|Memory|Disk|
  |:-:|:-:|:-:|
  |Ubuntu 18.04|2048MB|20GB|

## 1. 사전 준비
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
- Fabric Binary 설치
  ```sh
  # 현 위치에 fabric-samples 디렉토리가 생긴다.
  curl -sSL https://bit.ly/2ysbOFE | bash -s -- 2.2.1 1.4.9

  # Installed docker image 확인
  docker images
  ```

## 3-1. 테스트 네트워크 구축하기 -1 (Shell script 이용)
> Hyperledger Fabric은 잘 만들어진 Shell script를 제공한다.<br>
> 이를 이용하여 채널 생성, 체인코드 배포 등을 누구나 쉽게 할 수 있다.<br>
### 3-1-1. 네트워크 시작
```sh
cd fabric-samples/test-network
./network.sh up
```
### 3-1-2. 채널 생성
```sh
./network.sh createChannel
```
### 3-1-3. 체인코드 배포
```sh
./network.sh deployCC -ccn basic -ccp ../asset-transfer-basic/chaincode-go \
-ccl go
```
### 3-1-4. 체인코드 실행
- 환경변수 설정
  ```sh
  export PATH=${PWD}/../bin:$PATH
  export FABRIC_CFG_PATH=$PWD/../config/
  
  # Org1 설정
  export CORE_PEER_TLS_ENABLED=true
  export CORE_PEER_LOCALMSPID="Org1MSP"
  export CORE_PEER_TLS_ROOTCERT_FILE=${PWD}/organizations/peerOrganizations/org1.example.com/peers/peer0.org1.example.com/tls/ca.crt
  export CORE_PEER_MSPCONFIGPATH=${PWD}/organizations/peerOrganizations/org1.example.com/users/Admin@org1.example.com/msp
  export CORE_PEER_ADDRESS=localhost:7051
  ```
- Invoke
  ```sh
  peer chaincode invoke -o localhost:7050 --ordererTLSHostnameOverride orderer.example.com --tls --cafile ${PWD}/organizations/ordererOrganizations/example.com/orderers/orderer.example.com/msp/tlscacerts/tlsca.example.com-cert.pem -C mychannel -n basic --peerAddresses localhost:7051 --tlsRootCertFiles ${PWD}/organizations/peerOrganizations/org1.example.com/peers/peer0.org1.example.com/tls/ca.crt --peerAddresses localhost:9051 --tlsRootCertFiles ${PWD}/organizations/peerOrganizations/org2.example.com/peers/peer0.org2.example.com/tls/ca.crt -c '{"function":"InitLedger","Args":[]}'

  # 다음이 나오면 성공
  # -> INFO 001 Chaincode invoke successful. result: status:200
  ```
- Query
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
  ```
## 3-2. 테스트 네트워크 구축하기 -2 (수작업)
> Hyperledger Fabric에서 제공하는 쉘 스크립트를 사용하지 않고 직접 위의 과정을 <br>
> 진행해보자.
### 3-2-1. 사전 준비
```sh
cd fabric-samples
mkdir -p my-network/{organizations,configtx,docker}
mkdir -p my-network/organizations/cryptogen
# 관련 파일 복사
cp -r bin/ config/ ./my-network  
# 환경변수 설정
cd ./my-network
export PATH=$PATH:${PWD}/bin
```
### 3-2-2. Key 생성
- crypto-config 파일 생성
  ```sh
  touch fabric-samples/my-network/organizations/cryptogen/crypto-config-org1.yaml
  touch fabric-samples/my-network/organizations/cryptogen/crypto-config-org2.yaml
  touch fabric-samples/my-network/organizations/cryptogen/crypto-config-orderer.yaml
  ```
  ```yaml
  # crypto-config-org1.yaml
  PeerOrgs:
    - Name: Org1
      Domain: org1.example.com
      EnableNodeOUs: true
      Template:
        Count: 1
        SANS:
          - localhost
      Users:
        Count: 1
  ```
  ```yaml
  # crypto-config-org2.yaml
  PeerOrgs:
    - Name: Org2
      Domain: org2.example.com
      EnableNodeOUs: true
      Template:
        Count: 1
        SANS:
          - localhost
      Users:
        Count: 1
  ```
  ```yaml
  # crypto-config-orderer.yaml
  OrdererOrgs:
    - Name: Orderer
      Domain: example.com
      EnableNodeOUs: true
      Specs:
        - Hostname: orderer
          SANS:
            - localhost
  ```
- key 생성
  ```sh
  cd fabric-samples/my-network
  cryptogen generate --config=./organizations/cryptogen/crypto-config-org1.yaml --output="organizations"
  cryptogen generate --config=./organizations/cryptogen/crypto-config-org2.yaml --output="organizations"
  cryptogen generate --config=./organizations/cryptogen/crypto-config-orderer.yaml --output="organizations"
  ```
### 3-2-3. Genesis 파일 생성
- configtx 파일 생성
  ```sh
  touch fabric-samples/my-network/configtx/configtx.yaml
  ```
  ```yaml
  # configtx.yaml
  ---
  Organizations:
      - &OrdererOrg
          Name: OrdererOrg
          ID: OrdererMSP
          MSPDir: ../organizations/ordererOrganizations/example.com/msp
          Policies:
              Readers:
                  Type: Signature
                  Rule: "OR('OrdererMSP.member')"
              Writers:
                  Type: Signature
                  Rule: "OR('OrdererMSP.member')"
              Admins:
                  Type: Signature
                  Rule: "OR('OrdererMSP.admin')"
          OrdererEndpoints:
              - orderer.example.com:7050
      - &Org1
          Name: Org1MSP
          ID: Org1MSP
          MSPDir: ../organizations/peerOrganizations/org1.example.com/msp
          Policies:
              Readers:
                  Type: Signature
                  Rule: "OR('Org1MSP.admin', 'Org1MSP.peer', 'Org1MSP.client')"
              Writers:
                  Type: Signature
                  Rule: "OR('Org1MSP.admin', 'Org1MSP.client')"
              Admins:
                  Type: Signature
                  Rule: "OR('Org1MSP.admin')"
              Endorsement:
                  Type: Signature
                  Rule: "OR('Org1MSP.peer')"
          AnchorPeers:
            - Host: peer0.org1.example.com
              Port: 7051
      - &Org2
          Name: Org2MSP
          ID: Org2MSP
          MSPDir: ../organizations/peerOrganizations/org2.example.com/msp
          Policies:
              Readers:
                  Type: Signature
                  Rule: "OR('Org2MSP.admin', 'Org2MSP.peer', 'Org2MSP.client')"
              Writers:
                  Type: Signature
                  Rule: "OR('Org2MSP.admin', 'Org2MSP.client')"
              Admins:
                  Type: Signature
                  Rule: "OR('Org2MSP.admin')"
              Endorsement:
                  Type: Signature
                  Rule: "OR('Org2MSP.peer')"
          AnchorPeers:
            - Host: peer0.org2.example.com
              Port: 9051

  Capabilities:
      Channel: &ChannelCapabilities
          V2_0: true
      Orderer: &OrdererCapabilities
          V2_0: true
      Application: &ApplicationCapabilities
          V2_0: true

  Application: &ApplicationDefaults
      Organizations:
      Policies:
          Readers:
              Type: ImplicitMeta
              Rule: "ANY Readers"
          Writers:
              Type: ImplicitMeta
              Rule: "ANY Writers"
          Admins:
              Type: ImplicitMeta
              Rule: "MAJORITY Admins"
          LifecycleEndorsement:
              Type: ImplicitMeta
              Rule: "MAJORITY Endorsement"
          Endorsement:
              Type: ImplicitMeta
              Rule: "MAJORITY Endorsement"
      Capabilities:
          <<: *ApplicationCapabilities

  Orderer: &OrdererDefaults
      OrdererType: etcdraft
      Addresses:
          - orderer.example.com:7050
      EtcdRaft:
          Consenters:
          - Host: orderer.example.com
            Port: 7050
            ClientTLSCert: ../organizations/ordererOrganizations/example.com/orderers/orderer.example.com/tls/server.crt
            ServerTLSCert: ../organizations/ordererOrganizations/example.com/orderers/orderer.example.com/tls/server.crt
      BatchTimeout: 2s
      BatchSize:
          MaxMessageCount: 10
          AbsoluteMaxBytes: 99 MB
          PreferredMaxBytes: 512 KB
      Organizations:
      Policies:
          Readers:
              Type: ImplicitMeta
              Rule: "ANY Readers"
          Writers:
              Type: ImplicitMeta
              Rule: "ANY Writers"
          Admins:
              Type: ImplicitMeta
              Rule: "MAJORITY Admins"
          BlockValidation:
              Type: ImplicitMeta
              Rule: "ANY Writers"

  Channel: &ChannelDefaults
      Policies:
          Readers:
              Type: ImplicitMeta
              Rule: "ANY Readers"
          Writers:
              Type: ImplicitMeta
              Rule: "ANY Writers"
          Admins:
              Type: ImplicitMeta
              Rule: "MAJORITY Admins"

      Capabilities:
          <<: *ChannelCapabilities

  Profiles:
      TwoOrgsOrdererGenesis:
          <<: *ChannelDefaults
          Orderer:
              <<: *OrdererDefaults
              Organizations:
                  - *OrdererOrg
              Capabilities:
                  <<: *OrdererCapabilities
          Consortiums:
              SampleConsortium:
                  Organizations:
                      - *Org1
                      - *Org2
      TwoOrgsChannel:
          Consortium: SampleConsortium
          <<: *ChannelDefaults
          Application:
              <<: *ApplicationDefaults
              Organizations:
                  - *Org1
                  - *Org2
              Capabilities:
                  <<: *ApplicationCapabilities
  ```
- genesis block 생성
  ```sh
  cd fabric-samples/my-network
  configtxgen -profile TwoOrgsOrdererGenesis -channelID system-channel -outputBlock ./system-genesis-block/genesis.block -configPath ./configtx
  # 확인
  ls ./system-genesis-block
  ```
### 3-2-4. 네트워크 시작
- docker-compose 작성
  ```sh
  touch fabric-samples/my-network/docker/docker-compose.yaml
  ```
  ```yaml
  version: '2'

  volumes:
    orderer.example.com:
    peer0.org1.example.com:
    peer0.org2.example.com:

  networks:
    test:

  services:

    orderer.example.com:
      container_name: orderer.example.com
      image: hyperledger/fabric-orderer:2.2
      environment:
        - FABRIC_LOGGING_SPEC=INFO
        - ORDERER_GENERAL_LISTENADDRESS=0.0.0.0
        - ORDERER_GENERAL_LISTENPORT=7050
        - ORDERER_GENERAL_GENESISMETHOD=file
        - ORDERER_GENERAL_GENESISFILE=/var/hyperledger/orderer/orderer.genesis.block
        - ORDERER_GENERAL_LOCALMSPID=OrdererMSP
        - ORDERER_GENERAL_LOCALMSPDIR=/var/hyperledger/orderer/msp
        # enabled TLS
        - ORDERER_GENERAL_TLS_ENABLED=true
        - ORDERER_GENERAL_TLS_PRIVATEKEY=/var/hyperledger/orderer/tls/server.key
        - ORDERER_GENERAL_TLS_CERTIFICATE=/var/hyperledger/orderer/tls/server.crt
        - ORDERER_GENERAL_TLS_ROOTCAS=[/var/hyperledger/orderer/tls/ca.crt]
        - ORDERER_GENERAL_CLUSTER_CLIENTCERTIFICATE=/var/hyperledger/orderer/tls/server.crt
        - ORDERER_GENERAL_CLUSTER_CLIENTPRIVATEKEY=/var/hyperledger/orderer/tls/server.key
        - ORDERER_GENERAL_CLUSTER_ROOTCAS=[/var/hyperledger/orderer/tls/ca.crt]
      working_dir: /opt/gopath/src/github.com/hyperledger/fabric
      command: orderer
      volumes:
          - ../system-genesis-block/genesis.block:/var/hyperledger/orderer/orderer.genesis.block
          - ../organizations/ordererOrganizations/example.com/orderers/orderer.example.com/msp:/var/hyperledger/orderer/msp
          - ../organizations/ordererOrganizations/example.com/orderers/orderer.example.com/tls/:/var/hyperledger/orderer/tls
          - orderer.example.com:/var/hyperledger/production/orderer
      ports:
        - 7050:7050
      networks:
        - test

    peer0.org1.example.com:
      container_name: peer0.org1.example.com
      image: hyperledger/fabric-peer:2.2
      environment:
        - CORE_VM_ENDPOINT=unix:///host/var/run/docker.sock
        - CORE_VM_DOCKER_HOSTCONFIG_NETWORKMODE=net_test
        - FABRIC_LOGGING_SPEC=INFO
        - CORE_PEER_TLS_ENABLED=true
        - CORE_PEER_PROFILE_ENABLED=true
        - CORE_PEER_TLS_CERT_FILE=/etc/hyperledger/fabric/tls/server.crt
        - CORE_PEER_TLS_KEY_FILE=/etc/hyperledger/fabric/tls/server.key
        - CORE_PEER_TLS_ROOTCERT_FILE=/etc/hyperledger/fabric/tls/ca.crt
        # Peer specific variabes
        - CORE_PEER_ID=peer0.org1.example.com
        - CORE_PEER_ADDRESS=peer0.org1.example.com:7051
        - CORE_PEER_LISTENADDRESS=0.0.0.0:7051
        - CORE_PEER_CHAINCODEADDRESS=peer0.org1.example.com:7052
        - CORE_PEER_CHAINCODELISTENADDRESS=0.0.0.0:7052
        - CORE_PEER_GOSSIP_BOOTSTRAP=peer0.org1.example.com:7051
        - CORE_PEER_GOSSIP_EXTERNALENDPOINT=peer0.org1.example.com:7051
        - CORE_PEER_LOCALMSPID=Org1MSP
      volumes:
          - /var/run/docker.sock:/host/var/run/docker.sock
          - ../organizations/peerOrganizations/org1.example.com/peers/peer0.org1.example.com/msp:/etc/hyperledger/fabric/msp
          - ../organizations/peerOrganizations/org1.example.com/peers/peer0.org1.example.com/tls:/etc/hyperledger/fabric/tls
          - peer0.org1.example.com:/var/hyperledger/production
      working_dir: /opt/gopath/src/github.com/hyperledger/fabric/peer
      command: peer node start
      ports:
        - 7051:7051
      networks:
        - test

    peer0.org2.example.com:
      container_name: peer0.org2.example.com
      image: hyperledger/fabric-peer:2.2
      environment:
        #Generic peer variables
        - CORE_VM_ENDPOINT=unix:///host/var/run/docker.sock
        - CORE_VM_DOCKER_HOSTCONFIG_NETWORKMODE=net_test
        - FABRIC_LOGGING_SPEC=INFO
        - CORE_PEER_TLS_ENABLED=true
        - CORE_PEER_PROFILE_ENABLED=true
        - CORE_PEER_TLS_CERT_FILE=/etc/hyperledger/fabric/tls/server.crt
        - CORE_PEER_TLS_KEY_FILE=/etc/hyperledger/fabric/tls/server.key
        - CORE_PEER_TLS_ROOTCERT_FILE=/etc/hyperledger/fabric/tls/ca.crt
        # Peer specific variabes
        - CORE_PEER_ID=peer0.org2.example.com
        - CORE_PEER_ADDRESS=peer0.org2.example.com:9051
        - CORE_PEER_LISTENADDRESS=0.0.0.0:9051
        - CORE_PEER_CHAINCODEADDRESS=peer0.org2.example.com:9052
        - CORE_PEER_CHAINCODELISTENADDRESS=0.0.0.0:9052
        - CORE_PEER_GOSSIP_EXTERNALENDPOINT=peer0.org2.example.com:9051
        - CORE_PEER_GOSSIP_BOOTSTRAP=peer0.org2.example.com:9051
        - CORE_PEER_LOCALMSPID=Org2MSP
      volumes:
          - /var/run/docker.sock:/host/var/run/docker.sock
          - ../organizations/peerOrganizations/org2.example.com/peers/peer0.org2.example.com/msp:/etc/hyperledger/fabric/msp
          - ../organizations/peerOrganizations/org2.example.com/peers/peer0.org2.example.com/tls:/etc/hyperledger/fabric/tls
          - peer0.org2.example.com:/var/hyperledger/production
      working_dir: /opt/gopath/src/github.com/hyperledger/fabric/peer
      command: peer node start
      ports:
        - 9051:9051
      networks:
        - test
    
    cli:
      container_name: cli
      image: hyperledger/fabric-tools:2.2
      tty: true
      stdin_open: true
      environment:
        - GOPATH=/opt/gopath
        - CORE_VM_ENDPOINT=unix:///host/var/run/docker.sock
        - FABRIC_LOGGING_SPEC=INFO
        #- FABRIC_LOGGING_SPEC=DEBUG
      working_dir: /opt/gopath/src/github.com/hyperledger/fabric/peer
      command: /bin/bash
      volumes:
          - /var/run/:/host/var/run/
          - ../organizations:/opt/gopath/src/github.com/hyperledger/fabric/peer/organizations
          # - ../scripts:/opt/gopath/src/github.com/hyperledger/fabric/peer/scripts/
      depends_on:
        - peer0.org1.example.com
        - peer0.org2.example.com
      networks:
        - test
  ``` 
- 네트워크 시작
  ```sh
  cd fabric-samples/my-network/docker
  docker-compose up -d
  # 컨테이너 확인
  docker ps -a
  ```
### 3-2-5. 채널 생성
- channel.tx 생성
  ```sh
  cd fabric-samples/my-network
  configtxgen -profile TwoOrgsChannel -outputCreateChannelTx ./channel-artifacts/mychannel.tx -channelID mychannel -configPath ./configtx
  # mychannel.tx 확인
  ls ./channel-artifacts
  ```
- 채널 생성
  ```sh
  # 환경변수 설정
  cd fabric-samples/my-network  
  export FABRIC_CFG_PATH=${PWD}/config
  export CORE_PEER_TLS_ENABLED=true
  export ORDERER_CA=${PWD}/organizations/ordererOrganizations/example.com/orderers/orderer.example.com/msp/tlscacerts/tlsca.example.com-cert.pem
  export CORE_PEER_LOCALMSPID=Org1MSP
  export CORE_PEER_MSPCONFIGPATH=${PWD}/organizations/peerOrganizations/org1.example.com/users/Admin@org1.example.com/msp
  export CORE_PEER_TLS_ROOTCERT_FILE=${PWD}/organizations/peerOrganizations/org1.example.com/peers/peer0.org1.example.com/tls/ca.crt
  export CORE_PEER_ADDRESS=localhost:7051

  # 채널 생성
  peer channel create -o localhost:7050 -c mychannel --ordererTLSHostnameOverride orderer.example.com -f ./channel-artifacts/mychannel.tx --outputBlock ./channel-artifacts/mychannel.block --tls --cafile $ORDERER_CA

  # mychannel.block 확인
  ls channel-artifacts
  ```
### 3-2-6. 채널 조인
- 채널 조인
  ```sh
  #########################################################
  ## ORG1 조인
  # 환경변수 설정
  cd fabric-samples/my-network
  export FABRIC_CFG_PATH=${PWD}/config
  export CORE_PEER_TLS_ENABLED=true
  export CORE_PEER_LOCALMSPID="Org1MSP"
  export CORE_PEER_TLS_ROOTCERT_FILE=${PWD}/organizations/peerOrganizations/org1.example.com/peers/peer0.org1.example.com/tls/ca.crt
  export CORE_PEER_MSPCONFIGPATH=${PWD}/organizations/peerOrganizations/org1.example.com/users/Admin@org1.example.com/msp
  export CORE_PEER_ADDRESS=localhost:7051

  # 채널조인
  peer channel join -b ./channel-artifacts/mychannel.block

  # 조인 확인
  peer channel list

  #########################################################
  ## ORG2 조인
  # 환경변수 설정
  cd fabric-samples/my-network
  export FABRIC_CFG_PATH=${PWD}/config
  export CORE_PEER_TLS_ENABLED=true
  export CORE_PEER_LOCALMSPID="Org2MSP"
  export CORE_PEER_TLS_ROOTCERT_FILE=${PWD}/organizations/peerOrganizations/org2.example.com/peers/peer0.org2.example.com/tls/ca.crt
  export CORE_PEER_MSPCONFIGPATH=${PWD}/organizations/peerOrganizations/org2.example.com/users/Admin@org2.example.com/msp
  export CORE_PEER_ADDRESS=localhost:9051

  # 채널조인
  peer channel join -b ./channel-artifacts/mychannel.block

  # 조인 확인
  peer channel list
  ```
### 3-2-7. 앵커피어 설정