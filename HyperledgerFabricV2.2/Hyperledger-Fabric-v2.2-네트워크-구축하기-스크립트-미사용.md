# Hyperledger Fabric v2.2 네트워크 구축하기 스크립트 미사용
## 🎁 목차
- [Hyperledger Fabric v2.2 네트워크 구축하기 스크립트 미사용](#Hyperledger-Fabric-v2.2-네트워크-구축하기-스크립트-미사용)
  - [🎁 목차](#🎁-목차)
  - [0. 개요](#0.-개요)
  - [1. 사전 준비](#1.-사전-준비)
  - [2. 테스트 네트워크 구축하기 (스크립트 미사용)](#2.-테스트-네트워크-구축하기-(스크립트-미사용))
    - [2-1. 사전 준비](#2-1.-사전-준비)
    - [2-2. Key 생성](#2-2.-Key-생성)
    - [2-3. Genesis 파일 생성](#2-3.-Genesis-파일-생성)
    - [2-4. 네트워크 시작](#2-4.-네트워크-시작)
    - [2-5. 채널 생성](#2-5.-채널-생성)
    - [2-6. 채널 조인](#2-6.-채널-조인)
    - [2-7. 체인코드](#2-7.-체인코드)
  - [3. 마치며](#3.-마치며)
## 0. 개요
> 이전 포스트에서는 Shell script를 사용하여 Fabric 네트워크를 구성했다.
> 이제는 Shell script를 사용하지 않고 커맨드라인을 이용하여 네트워크를 구축해보자.

## 1. 사전 준비
> 마찬가지로 이전 포스트에서와 같은 준비물이 필요하다.
> 아래의 링크에 접속해 "**1.사전준비, 2. Hyperledger Fabric v2.2 인스톨**"을 수행하자.
> [**Hyperledger Fabric prerequisites**](https://velog.io/@rivernine/Hyperledger-Fabric-v2.2-%ED%85%8C%EC%8A%A4%ED%8A%B8-%EB%84%A4%ED%8A%B8%EC%9B%8C%ED%81%AC-%EA%B5%AC%EC%B6%95%ED%95%98%EA%B8%B0#1-%EC%82%AC%EC%A0%84-%EC%A4%80%EB%B9%84)

## 2. 테스트 네트워크 구축하기 (스크립트 미사용)
> Hyperledger Fabric에서 제공하는 쉘 스크립트를 사용하지 않고 직접 위의 과정을 <br>
> 진행해보자.

### 2-1. 사전 준비
```sh
cd fabric-samples
mkdir -p my-network/{organizations,configtx,docker}
mkdir -p my-network/organizations/cryptogen
# 관련 파일 복사
cp -r bin/ config/ asset-transfer-basic/chaincode-go/ ./my-network  
# 환경변수 설정
cd ./my-network
export PATH=$PATH:${PWD}/bin
```
### 2-2. Key 생성
- crypto-config 파일 생성
  ```sh
  cd fabric-samples/my-network
  touch ./organizations/cryptogen/crypto-config-org1.yaml
  touch ./organizations/cryptogen/crypto-config-org2.yaml
  touch ./organizations/cryptogen/crypto-config-orderer.yaml
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
  
  cryptogen generate \
    --config=./organizations/cryptogen/crypto-config-org1.yaml \
    --output="organizations"
  cryptogen generate \
    --config=./organizations/cryptogen/crypto-config-org2.yaml \
    --output="organizations"
  cryptogen generate \
    --config=./organizations/cryptogen/crypto-config-orderer.yaml \
    --output="organizations"

  # 확인
  ls ./organizations/cryptogen
  ```
  * crypto-config.yaml을 기반으로 key를 생성한다.
### 2-3. Genesis 파일 생성
- configtx 파일 생성
  ```sh
  cd fabric-samples/my-network
  touch ./configtx/configtx.yaml
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
  configtxgen \
    -profile TwoOrgsOrdererGenesis \
    -channelID system-channel \
    -outputBlock ./system-genesis-block/genesis.block \
    -configPath ./configtx
  # 확인
  ls ./system-genesis-block
  ```
  * configtx.yaml을 기반으로 genesis block을 생성한다.
### 2-4. 네트워크 시작
- docker-compose.yaml 작성
  ```sh
  cd fabric-samples/my-network
  touch ./docker/docker-compose.yaml
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
  COMPOSE_PROJECT_NAME=net docker-compose up -d
  # 컨테이너 확인
  docker ps -a
  ```
  * peer 2개, orderer 1개, cli(fabric tools) 1개의 컨테이너를 확인할 수 있다.
  * 드디어 블록체인 네트워크를 구성했다!!😆
    이제 채널을 구성하고 체인코드를 배포하자.
### 2-5. 채널 생성
- 채널 트랜잭션 생성
  ```sh
  # 환경변수 설정
  cd fabric-samples/my-network
  export FABRIC_CFG_PATH=${PWD}/configtx

  # 채널 트랜잭션 생성
  configtxgen \
    -profile TwoOrgsChannel \
    -outputCreateChannelTx ./channel-artifacts/mychannel.tx \
    -channelID mychannel
  # mychannel.tx 확인
  ls ./channel-artifacts
  ```
- 채널 블록 생성
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

  # 채널 블록 생성
  peer channel create \
    -o localhost:7050 \
    -c mychannel \
    --ordererTLSHostnameOverride orderer.example.com \
    -f ./channel-artifacts/mychannel.tx \
    --outputBlock ./channel-artifacts/mychannel.block \
    --tls \
    --cafile $ORDERER_CA

  # mychannel.block 확인
  ls channel-artifacts
  ```
### 2-6. 채널 조인
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

  # ORG1 조인 확인
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

  # ORG2 조인 확인
  peer channel list
  ```
  * 2-5에서 생성한 채널 블록을 이용하여 각 ORG마다 채널 조인을 시켜준다.

### 2-7. 앵커피어설정
- **[ORG1]** fetch config block
  ```sh
  # 환경변수 설정
  cd fabric-samples/my-network
  export ORDERER_CA=${PWD}/organizations/ordererOrganizations/example.com/orderers/orderer.example.com/msp/tlscacerts/tlsca.example.com-cert.pem
  # 아래 과정은 모두 아래 path에서 진행

  mkdir anchor && cd anchor

  peer channel fetch config config_block.pb \
    -o localhost:7050 \
    --ordererTLSHostnameOverride orderer.example.com \
    -c mychannel \
    --tls \
    --cafile $ORDERER_CA
  ```
- **[ORG1]** decoding config block
  ```sh
  configtxlator proto_decode \
    --input config_block.pb \
    --type common.Block \
    | jq .data.data[0].payload.data.config \
    > Org1MSPconfig.json
  ```
- **[ORG1]** modify configuration
  ```sh
  jq '.channel_group.groups.Application.groups.Org1MSP.values += {"AnchorPeers":{"mod_policy": "Admins","value":{"anchor_peers": [{"host": "peer0.org1.example.com","port": 7051}]},"version": "0"}}' Org1MSPconfig.json \
    > Org1MSPmodified_config.json
  ```
- create config update (ORG1)
  ```sh
  configtxlator proto_encode \
    --input Org1MSPconfig.json \
    --type common.Config \
    > original_config.pb

  configtxlator proto_encode \
    --input Org1MSPmodified_config.json \
    --type common.Config \
    > modified_config.pb

  configtxlator compute_update \
    --channel_id mychannel \
    --original original_config.pb \
    --updated modified_config.pb \
    > config_update.pb

  configtxlator proto_decode \
    --input config_update.pb \
    --type common.ConfigUpdate \
    > config_update.json

  echo '{"payload":{"header":{"channel_header":{"channel_id":"mychannel", "type":2}},"data":{"config_update":'$(cat config_update.json)'}}}' \
    | jq . \
    > config_update_in_envelope.json

  configtxlator proto_encode \
    --input config_update_in_envelope.json \
    --type common.Envelope \
    > Org1MSPanchors.tx  
  ```
- **[ORG1]** sign
  ```sh
  cd fabric-samples/my-network

  export FABRIC_CFG_PATH=${PWD}/config
  export CORE_PEER_TLS_ENABLED=true
  export CORE_PEER_LOCALMSPID="Org1MSP"
  export CORE_PEER_TLS_ROOTCERT_FILE=${PWD}/organizations/peerOrganizations/org1.example.com/peers/peer0.org1.example.com/tls/ca.crt
  export CORE_PEER_MSPCONFIGPATH=${PWD}/organizations/peerOrganizations/org1.example.com/users/Admin@org1.example.com/msp
  export CORE_PEER_ADDRESS=localhost:7051

  cd ./anchor
  peer channel signconfigtx -f Org1MSPanchors.tx
  ```
- **[ORG1]** update
  ```sh
  cd ./anchor
  peer channel update \
    -o localhost:7050 \
    --ordererTLSHostnameOverride orderer.example.com \
    -c mychannel \
    -f Org1MSPanchors.tx \
    --tls \
    --cafile $ORDERER_CA
  ```
**<h3>ORG2도 동일하게 진행**</h3>
- **[ORG2]** fetch config block
  ```sh
  # 환경변수 설정
  cd fabric-samples/my-network
  export ORDERER_CA=${PWD}/organizations/ordererOrganizations/example.com/orderers/orderer.example.com/msp/tlscacerts/tlsca.example.com-cert.pem
  # 아래 과정은 모두 아래 path에서 진행
    
  sudo rm anchor/*
  cd anchor

  peer channel fetch config config_block.pb \
    -o localhost:7050 \
    --ordererTLSHostnameOverride orderer.example.com \
    -c mychannel \
    --tls \
    --cafile $ORDERER_CA
  ```
- **[ORG2]** decoding config block
  ```sh
  configtxlator proto_decode \
    --input config_block.pb \
    --type common.Block \
    | jq .data.data[0].payload.data.config \
    > Org2MSPconfig.json
  ```
- **[ORG2]** modify configuration
  ```sh
  jq '.channel_group.groups.Application.groups.Org2MSP.values += {"AnchorPeers":{"mod_policy": "Admins","value":{"anchor_peers": [{"host": "peer0.org2.example.com","port": 9051}]},"version": "0"}}' Org2MSPconfig.json \
    > Org2MSPmodified_config.json
  ```
- **[ORG2]** create config update
  ```sh
  configtxlator proto_encode \
    --input Org2MSPconfig.json \
    --type common.Config \
    > original_config.pb

  configtxlator proto_encode \
    --input Org2MSPmodified_config.json \
    --type common.Config \
    > modified_config.pb

  configtxlator compute_update \
    --channel_id mychannel \
    --original original_config.pb \
    --updated modified_config.pb \
    > config_update.pb

  configtxlator proto_decode \
    --input config_update.pb \
    --type common.ConfigUpdate \
    > config_update.json

  echo '{"payload":{"header":{"channel_header":{"channel_id":"mychannel", "type":2}},"data":{"config_update":'$(cat config_update.json)'}}}' \
    | jq . \
    > config_update_in_envelope.json

  configtxlator proto_encode \
    --input config_update_in_envelope.json \
    --type common.Envelope \
    > Org2MSPanchors.tx  
  ```
- **[ORG2]** sign
  ```sh
  cd fabric-samples/my-network
  export FABRIC_CFG_PATH=${PWD}/config
  export CORE_PEER_TLS_ENABLED=true
  export CORE_PEER_LOCALMSPID="Org2MSP"
  export CORE_PEER_TLS_ROOTCERT_FILE=${PWD}/organizations/peerOrganizations/org2.example.com/peers/peer0.org2.example.com/tls/ca.crt
  export CORE_PEER_MSPCONFIGPATH=${PWD}/organizations/peerOrganizations/org2.example.com/users/Admin@org2.example.com/msp
  export CORE_PEER_ADDRESS=localhost:9051

  cd anchor
  peer channel signconfigtx -f Org2MSPanchors.tx
  ```
- **[ORG2]** update
  ```sh
  peer channel update \
    -o localhost:7050 \
    --ordererTLSHostnameOverride orderer.example.com \
    -c mychannel \
    -f Org2MSPanchors.tx \
    --tls \
    --cafile $ORDERER_CA
  ```

### 2-8. 체인코드
> Fabric 2.x의 체인코드 라이프사이클은 1.x와 다르다.
> Fabric 1.x: Install -> Instantiate 
> Fabric 2.x: Package -> Install -> approve -> commit

- package
  ```sh
  cd fabric-samples/my-network
  peer lifecycle chaincode package basic.tar.gz \
    --path ./chaincode-go/ \
    --lang golang \
    --label basic_1

  # basic.tar.gz 확인
  ls -a
  ```
- install
  ```sh
  #########################################################
  ## ORG1 
  # 환경변수 설정
  cd fabric-samples/my-network
  export FABRIC_CFG_PATH=${PWD}/config
  export CORE_PEER_TLS_ENABLED=true
  export CORE_PEER_LOCALMSPID="Org1MSP"
  export CORE_PEER_TLS_ROOTCERT_FILE=${PWD}/organizations/peerOrganizations/org1.example.com/peers/peer0.org1.example.com/tls/ca.crt
  export CORE_PEER_MSPCONFIGPATH=${PWD}/organizations/peerOrganizations/org1.example.com/users/Admin@org1.example.com/msp
  export CORE_PEER_ADDRESS=localhost:7051

  # 체인코드 Install
  peer lifecycle chaincode install basic.tar.gz

  # ORG1 확인 및 Package ID 저장
  peer lifecycle chaincode queryinstalled  
  # Package ID: basic_1:9820659c595e662a849033ca23b4424e87a126e8f40b5f81ace59820b81fe8e7
  export PACKAGE_ID=basic_1:9820659c595e662a849033ca23b4424e87a126e8f40b5f81ace59820b81fe8e7

  #########################################################
  ## ORG2
  # 환경변수 설정
  cd fabric-samples/my-network
  export FABRIC_CFG_PATH=${PWD}/config
  export CORE_PEER_TLS_ENABLED=true
  export CORE_PEER_LOCALMSPID="Org2MSP"
  export CORE_PEER_TLS_ROOTCERT_FILE=${PWD}/organizations/peerOrganizations/org2.example.com/peers/peer0.org2.example.com/tls/ca.crt
  export CORE_PEER_MSPCONFIGPATH=${PWD}/organizations/peerOrganizations/org2.example.com/users/Admin@org2.example.com/msp
  export CORE_PEER_ADDRESS=localhost:9051

  # 체인코드 Install
  peer lifecycle chaincode install basic.tar.gz

  # ORG2 확인
  peer lifecycle chaincode queryinstalled
  # Package ID는 위와 동일
  ```
- approve
  ```sh
  #########################################################
  ## ORG1 
  # 환경변수 설정
  export ORDERER_CA=${PWD}/organizations/ordererOrganizations/example.com/orderers/orderer.example.com/msp/tlscacerts/tlsca.example.com-cert.pem
  export FABRIC_CFG_PATH=${PWD}/config
  export CORE_PEER_TLS_ENABLED=true
  export CORE_PEER_LOCALMSPID="Org1MSP"
  export CORE_PEER_TLS_ROOTCERT_FILE=${PWD}/organizations/peerOrganizations/org1.example.com/peers/peer0.org1.example.com/tls/ca.crt
  export CORE_PEER_MSPCONFIGPATH=${PWD}/organizations/peerOrganizations/org1.example.com/users/Admin@org1.example.com/msp
  export CORE_PEER_ADDRESS=localhost:7051

  # 체인코드 Approve
  peer lifecycle chaincode approveformyorg \
    -o localhost:7050 \
    --ordererTLSHostnameOverride orderer.example.com \
    --tls \
    --cafile $ORDERER_CA \
    --channelID mychannel \
    --name basic \
    --version 1 \
    --package-id $PACKAGE_ID \
    --sequence 1 NA NA NA

  # ORG1 확인
  peer lifecycle chaincode checkcommitreadiness --channelID mychannel --name basic --version 1 --sequence 1 NA NA NA NA
  # 출력 예시
  # Org1MSP: true
  # Org2MSP: false

  #########################################################
  ## ORG2
  # 환경변수 설정
  export ORDERER_CA=${PWD}/organizations/ordererOrganizations/example.com/orderers/orderer.example.com/msp/tlscacerts/tlsca.example.com-cert.pem
  export FABRIC_CFG_PATH=${PWD}/config
  export CORE_PEER_TLS_ENABLED=true
  export CORE_PEER_LOCALMSPID="Org2MSP"
  export CORE_PEER_TLS_ROOTCERT_FILE=${PWD}/organizations/peerOrganizations/org2.example.com/peers/peer0.org2.example.com/tls/ca.crt
  export CORE_PEER_MSPCONFIGPATH=${PWD}/organizations/peerOrganizations/org2.example.com/users/Admin@org2.example.com/msp
  export CORE_PEER_ADDRESS=localhost:9051

  # 체인코드 Approve
  peer lifecycle chaincode approveformyorg \
    -o localhost:7050 \
    --ordererTLSHostnameOverride orderer.example.com \
    --tls \
    --cafile $ORDERER_CA \
    --channelID mychannel \
    --name basic \
    --version 1 \
    --package-id $PACKAGE_ID \
    --sequence 1 NA NA NA

  # ORG2 확인
  peer lifecycle chaincode checkcommitreadiness \
    --channelID mychannel \
    --name basic \
    --version 1 \
    --sequence 1 NA NA NA NA
  # 출력 예시
  # Org1MSP: true
  # Org2MSP: true
  ```
- commit
  ```sh
  # 환경변수 설정
  export ORDERER_CA=${PWD}/organizations/ordererOrganizations/example.com/orderers/orderer.example.com/msp/tlscacerts/tlsca.example.com-cert.pem

  # 체인코드 Commit 
  peer lifecycle chaincode commit \
    -o localhost:7050 \
    --ordererTLSHostnameOverride orderer.example.com \
    --tls \
    --cafile $ORDERER_CA \
    --channelID mychannel \
    --name basic \
    --peerAddresses localhost:7051 \
    --tlsRootCertFiles ${PWD}/organizations/peerOrganizations/org1.example.com/peers/peer0.org1.example.com/tls/ca.crt \
    --peerAddresses localhost:9051 \
    --tlsRootCertFiles ${PWD}/organizations/peerOrganizations/org2.example.com/peers/peer0.org2.example.com/tls/ca.crt \
    --version 1 \
    --sequence 1 NA NA NA

  # Commit 확인
  ###########################################
  # ORG1
  # 환경변수 설정
  export FABRIC_CFG_PATH=${PWD}/config
  export CORE_PEER_TLS_ENABLED=true
  export CORE_PEER_LOCALMSPID="Org1MSP"
  export CORE_PEER_TLS_ROOTCERT_FILE=${PWD}/organizations/peerOrganizations/org1.example.com/peers/peer0.org1.example.com/tls/ca.crt
  export CORE_PEER_MSPCONFIGPATH=${PWD}/organizations/peerOrganizations/org1.example.com/users/Admin@org1.example.com/msp
  export CORE_PEER_ADDRESS=localhost:7051

  # ORG1 확인
  peer lifecycle chaincode querycommitted --channelID mychannel --name basic
  # 출력
  # Version: 1, Sequence: 1, Endorsement Plugin: escc, Validation Plugin: vscc, Approvals: [Org1MSP: true, Org2MSP: true]

  ###########################################
  # ORG2
  # 환경변수 설정
  export FABRIC_CFG_PATH=${PWD}/config
  export CORE_PEER_TLS_ENABLED=true
  export CORE_PEER_LOCALMSPID="Org2MSP"
  export CORE_PEER_TLS_ROOTCERT_FILE=${PWD}/organizations/peerOrganizations/org2.example.com/peers/peer0.org2.example.com/tls/ca.crt
  export CORE_PEER_MSPCONFIGPATH=${PWD}/organizations/peerOrganizations/org2.example.com/users/Admin@org2.example.com/msp
  export CORE_PEER_ADDRESS=localhost:9051

  # ORG2 확인
  peer lifecycle chaincode querycommitted --channelID mychannel --name basic
  # 출력
  # Version: 1, Sequence: 1, Endorsement Plugin: escc, Validation Plugin: vscc, Approvals: [Org1MSP: true, Org2MSP: true]
  ```
  * 이제 네트워크에 체인코드 예제가 배포가 되었다.
    해당 체인코드를 실행시켜보자!!
  * Invoke와 Query는 각각 블록체인에 write/read, read 기능을 위해 쓰인다.
- Invoke
  ```sh
  # 환경변수 설정
  export ORDERER_CA=${PWD}/organizations/ordererOrganizations/example.com/orderers/orderer.example.com/msp/tlscacerts/tlsca.example.com-cert.pem

  # 체인코드 Invoke
  peer chaincode invoke \
    -o localhost:7050 \
    --ordererTLSHostnameOverride orderer.example.com \
    --tls \
    --cafile $ORDERER_CA \
    -C mychannel \
    -n basic \
    --peerAddresses localhost:7051 \
    --tlsRootCertFiles ${PWD}/organizations/peerOrganizations/org1.example.com/peers/peer0.org1.example.com/tls/ca.crt \
    --peerAddresses localhost:9051 \
    --tlsRootCertFiles ${PWD}/organizations/peerOrganizations/org2.example.com/peers/peer0.org2.example.com/tls/ca.crt \
    -c '{"function":"InitLedger","Args":[]}'

  # 출력
  # 2021-02-02 16:10:19.632 KST [chaincodeCmd] chaincodeInvokeOrQuery -> INFO 001 Chaincode invoke successful. result: status:200 
  ```
- Query
  ```sh
  peer chaincode query \
    -C mychannel \
    -n basic \
    -c '{"Args":["GetAllAssets"]}'

  # 출력
  #[{"ID":"asset1","color":"blue","size":5,"owner":"Tomoko","appraisedValue":300},{"ID":"asset2","color":"red","size":5,"owner":"Brad","appraisedValue":400},{"ID":"asset3","color":"green","size":10,"owner":"Jin Soo","appraisedValue":500},{"ID":"asset4","color":"yellow","size":10,"owner":"Max","appraisedValue":600},{"ID":"asset5","color":"black","size":15,"owner":"Adriana","appraisedValue":700},{"ID":"asset6","color":"white","size":15,"owner":"Michel","appraisedValue":800}]
  ```

## 3. 마치며
> 이제 어느정도 Hyperledger Fabric을 핸들링 할 수 있다.
> 하지만 key파일이 평문으로 저장되는 허점이 존재한다.
> 다음 포스트에서는 softHSM을 적용하여 보완 해 볼 것이다.