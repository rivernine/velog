
package main

import (
	"context"
	"flag"
	"fmt"
	"io/ioutil"
	"math"
	"os"
	"strings"
	"time"
	"encoding/base64"
	"encoding/json"

	"github.com/hyperledger/fabric/common/crypto"
	"github.com/hyperledger/fabric/common/flogging"
	"github.com/hyperledger/fabric/common/localmsp"
	// genesisconfig "github.com/hyperledger/fabric/common/tools/configtxgen/localconfig"
	"github.com/hyperledger/fabric/common/tools/protolator"
	"github.com/hyperledger/fabric/common/util"
	"github.com/hyperledger/fabric/core/comm"
	// config2 "github.com/hyperledger/fabric/core/config"
	"github.com/hyperledger/fabric/msp"
	common2 "github.com/hyperledger/fabric/peer/common"
	"github.com/hyperledger/fabric/protos/common"
	"github.com/hyperledger/fabric/protos/orderer"
	"github.com/hyperledger/fabric/protos/peer"
	"github.com/hyperledger/fabric/protos/utils"
	"github.com/spf13/viper"
)

var (
	channelID        string
	serverAddr       string
	clientKeyPath    string
	clientCertPath   string
	serverRootCAPath string
	seek             int
	quiet            bool
	filtered         bool
	tlsEnabled       bool
	mTlsEnabled      bool

	oldest  = &orderer.SeekPosition{Type: &orderer.SeekPosition_Oldest{Oldest: &orderer.SeekOldest{}}}
	newest  = &orderer.SeekPosition{Type: &orderer.SeekPosition_Newest{Newest: &orderer.SeekNewest{}}}
	maxStop = &orderer.SeekPosition{Type: &orderer.SeekPosition_Specified{Specified: &orderer.SeekSpecified{Number: math.MaxUint64}}}
)

const (
	OLDEST = -2
	NEWEST = -1

	ROOT = "configtx"
)

var logger = flogging.MustGetLogger("eventsclient")

// deliverClient abstracts common interface
// for deliver and deliverfiltered services
type deliverClient interface {
	Send(*common.Envelope) error
	Recv() (*peer.DeliverResponse, error)
}

// eventsClient client to get connected to the
// events peer delivery system
type eventsClient struct {
	client      deliverClient
	signer      crypto.LocalSigner
	tlsCertHash []byte
}

type Block struct {
	Data		map[string]interface{}
	Header		map[string]interface{}
	Metadata	map[string]interface{}
}
type DataSliceInfo struct {
	Payload		map[string]interface{}
	Signature 	string
}

type ActionsSliceInfo struct {
	Header		map[string]interface{}
	Payload		map[string]interface{}
}

type PayloadActionInfo struct {
	Endorsements				[]interface{}
	Proposal_response_payload	map[string]interface{}
}

type Proposal_response_payloadExtensionInfo struct {
	Chaincode_id		map[string]interface{}
	Events				map[string]interface{}
	Response			map[string]interface{}
	Results				map[string]interface{}
	Token_expectation	map[string]interface{}
}

type Ns_rwsetSliceInfo struct {
	Collection_hased_rwset	map[string]interface{}
	Namespace				string					// chaincode name
	Rwset					map[string]interface{}	// rw set

}

type WriteInfo struct {
	Is_delete	bool
	Key			string
	Value		string
}

func (r *eventsClient) seekOldest() error {
	return r.client.Send(r.seekHelper(oldest, maxStop))
}

func (r *eventsClient) seekNewest() error {
	return r.client.Send(r.seekHelper(newest, maxStop))
}

func (r *eventsClient) seekSingle(blockNumber uint64) error {
	specific := &orderer.SeekPosition{Type: &orderer.SeekPosition_Specified{Specified: &orderer.SeekSpecified{Number: blockNumber}}}
	return r.client.Send(r.seekHelper(specific, specific))
}

func (r *eventsClient) seekHelper(start *orderer.SeekPosition, stop *orderer.SeekPosition) *common.Envelope {
	env, err := utils.CreateSignedEnvelopeWithTLSBinding(common.HeaderType_DELIVER_SEEK_INFO, channelID, r.signer, &orderer.SeekInfo{
		Start:    start,
		Stop:     stop,
		Behavior: orderer.SeekInfo_BLOCK_UNTIL_READY,
	}, 0, 0, r.tlsCertHash)
	if err != nil {
		panic(err)
	}
	return env
}

//func FindEvent (s interface{}) (bool, string) {
//	value := fmt.Sprintf("%v", s)
//	if value != "" {
//		return true, value
//	}

//	return false, ""
//}

func (r *eventsClient) readEventsStream() {
	for {
		msg, err := r.client.Recv()
		if err != nil {
			logger.Info("Error receiving:", err)
			return
		}

		switch t := msg.Type.(type) {
		case *peer.DeliverResponse_Status:
			logger.Info("Got status ", t)
			return
		case *peer.DeliverResponse_Block:
			if !quiet {
				logger.Info("Received block: ")
				err = protolator.DeepMarshalJSON(os.Stdout, t.Block)
				if err != nil {
					fmt.Printf("  Error pretty printing block: %s", err)
				}
				// Block log 원본 
				file, err := os.OpenFile("./log/blockhistory.log", os.O_CREATE|os.O_WRONLY|os.O_APPEND, 0666)
				if err != nil {	fmt.Printf("  File write error !" )	}
				file.WriteString("{\"Block\":\"Created\"}\n")
				err = protolator.DeepMarshalJSON(file, t.Block)
				file.Close()
				
				// 현재 발생한 LOG만 담은 file 생성
				tmpFile, err2 := os.OpenFile("./log/tmpblockhistory.log", os.O_CREATE|os.O_WRONLY|os.O_TRUNC, 0666)
				if err2 != nil { fmt.Printf("  File write error !" ) }
				err = protolator.DeepMarshalJSON(tmpFile, t.Block)
				tmpFile.Close()

				// Log filtering
				saveFilteredLog()

				// tmpFile 삭제
				if err = os.Remove("./log/tmpblockhistory.log"); err != nil { fmt.Println("Delete Error") }
				

			} else {
				logger.Info("Received block: ", t.Block.Header.Number)
			}
		case *peer.DeliverResponse_FilteredBlock:
			if !quiet {
				logger.Info("Received filtered block: ")
				err := protolator.DeepMarshalJSON(os.Stdout, t.FilteredBlock)
				if err != nil {
					fmt.Printf("  Error pretty printing filtered block: %s", err)
				}
			} else {
				logger.Info("Received filtered block: ", t.FilteredBlock.Number)
			}
		}
	}
}

func (r *eventsClient) seek(s int) error {
	var err error
	switch seek {
	case OLDEST:
		err = r.seekOldest()
	case NEWEST:
		err = r.seekNewest()
	default:
		err = r.seekSingle(uint64(seek))
	}
	return err
}

func main() {
	initConfig()
	initMSP()
	readCLInputs()

	if seek < OLDEST {
		logger.Info("Invalid seek value")
		flag.PrintDefaults()
		return
	}

	clientConfig := comm.ClientConfig{
		KaOpts:  comm.DefaultKeepaliveOptions,
		SecOpts: &comm.SecureOptions{},
		Timeout: 5 * time.Minute,
	}

	if tlsEnabled {
		clientConfig.SecOpts.UseTLS = true
		rootCert, err := ioutil.ReadFile(serverRootCAPath)
		if err != nil {
			logger.Info("error loading TLS root certificate", err)
			return
		}
		clientConfig.SecOpts.ServerRootCAs = [][]byte{rootCert}
		if mTlsEnabled {
			clientConfig.SecOpts.RequireClientCert = true
			clientKey, err := ioutil.ReadFile(clientKeyPath)
			if err != nil {
				logger.Info("error loading client TLS key from", clientKeyPath)
				return
			}
			clientConfig.SecOpts.Key = clientKey

			clientCert, err := ioutil.ReadFile(clientCertPath)
			if err != nil {
				logger.Info("error loading client TLS certificate from path", clientCertPath)
				return
			}
			clientConfig.SecOpts.Certificate = clientCert
		}
	}

	grpcClient, err := comm.NewGRPCClient(clientConfig)
	if err != nil {
		logger.Info("Error creating grpc client:", err)
		return
	}
	conn, err := grpcClient.NewConnection(serverAddr, "")
	if err != nil {
		logger.Info("Error connecting:", err)
		return
	}

	var client deliverClient
	if filtered {
		client, err = peer.NewDeliverClient(conn).DeliverFiltered(context.Background())
	} else {
		client, err = peer.NewDeliverClient(conn).Deliver(context.Background())
	}

	if err != nil {
		logger.Info("Error connecting:", err)
		return
	}

	events := &eventsClient{
		client: client,
		signer: localmsp.NewSigner(),
	}

	if mTlsEnabled {
		events.tlsCertHash = util.ComputeSHA256(grpcClient.Certificate().Certificate[0])
	}

	events.seek(seek)
	if err != nil {
		logger.Info("Received error:", err)
		return
	}

	events.readEventsStream()
}

func readCLInputs() {
	flag.StringVar(&serverAddr, "server", "peer0.org1.example.com:7051", "The RPC server to connect to.")
	flag.StringVar(&channelID, "channelID", "mychannel", "The channel ID to deliver from.")
	flag.BoolVar(&quiet, "quiet", false, "Only print the block number, will not attempt to print its block contents.")
	flag.BoolVar(&filtered, "filtered", false, "Whenever to read filtered events from the peer delivery service or get regular blocks.")
	flag.BoolVar(&tlsEnabled, "tls", true, "TLS enabled/disabled")
	flag.BoolVar(&mTlsEnabled, "mTls", true, "Mutual TLS enabled/disabled (whenever server side validates clients TLS certificate)")
	flag.StringVar(&clientKeyPath, "clientKey", "/crypto-config/peerOrganizations/org1.example.com/peers/peer0.org1.example.com/tls/server.key", "Specify path to the client TLS key")
	flag.StringVar(&clientCertPath, "clientCert", "/crypto-config/peerOrganizations/org1.example.com/peers/peer0.org1.example.com/tls/server.crt", "Specify path to the client TLS certificate")
	flag.StringVar(&serverRootCAPath, "rootCert", "/crypto-config/peerOrganizations/org1.example.com/peers/peer0.org1.example.com/tls/ca.crt", "Specify path to the server root CA certificate")
	flag.IntVar(&seek, "seek", NEWEST, "Specify the range of requested blocks."+
		"Acceptable values:"+
		"-2 (or -1) to start from oldest (or newest) and keep at it indefinitely."+
		"N >= 0 to fetch block N only.")
	flag.Parse()
}

func initMSP() {
	// Init the MSP
	// var mspMgrConfigDir = config2.GetPath("~/fabric-samples/first-network/crypto-config/peerOrganizations/org1.example.com/users/Admin@org1.example.com/msp")
	// var mspID = viper.GetString("Org1MSP")
	// var mspType = viper.GetString("bccsp")

	var mspMgrConfigDir = "/crypto-config/peerOrganizations/org1.example.com/users/Admin@org1.example.com/msp"
	var mspID = "Org1MSP"
	var mspType = "bccsp"

	if mspType == "" {
		mspType = msp.ProviderTypeToString(msp.FABRIC)
	}

	logger.Info(mspMgrConfigDir)
	logger.Info(mspID)
	logger.Info(mspType)

	err := common2.InitCrypto(mspMgrConfigDir, mspID, mspType)
	if err != nil { // Handle errors reading the config file
		panic(fmt.Sprintf("Cannot run client because %s", err.Error()))
	}
}

func initConfig() {
	// For environment variables.
	viper.SetEnvPrefix(ROOT)
	viper.AutomaticEnv()
	replacer := strings.NewReplacer(".", "_")
	viper.SetEnvKeyReplacer(replacer)

	err := common2.InitConfig(ROOT)
	if err != nil { // Handle errors reading the config file
		panic(fmt.Errorf("fatal error when initializing %s config : %s", ROOT, err))
	}
}

func saveFilteredLog() {
	var CHAINCODENAME = "mycc"

	jsonBytes, err := ioutil.ReadFile("./log/tmpblockhistory.log"); if err != nil { panic(err) }
	file, err := os.OpenFile("./log/filteredblockhistory.log", os.O_CREATE|os.O_WRONLY|os.O_APPEND, 0666)
	if err != nil {	fmt.Printf("  File write error !" )	}
	// [Unmarshal] Json -> Block struct
	var block Block
	if err := json.Unmarshal(jsonBytes, &block); err != nil { panic(err) }
	// [Marshal] Block struct -> Block Data -> Block Data' Json
	jsonBytes, err = json.Marshal(block.Data["data"])
	if err != nil { panic(err) }

	// [Unmarshal] Block Data' Json -> Block Data' Slice
	var dataSlice []interface{}
	if err := json.Unmarshal(jsonBytes, &dataSlice); err != nil { panic(err) }

	for _, data := range dataSlice {
		// [Marshal] Block Data' Slice -> Block Data' Slice Json
		jsonBytes, err = json.Marshal(data); if err != nil { panic(err) }
		// [Unmarshal] Block Data' Slice Json -> DataSliceInfo Struct
		var dataSliceInfo DataSliceInfo
		if err := json.Unmarshal(jsonBytes, &dataSliceInfo); err != nil { panic(err) }
		// [Marshal] DataSliceInfo Struct -> Data' Payload -> Payload Data Json
		jsonBytes, err = json.Marshal(dataSliceInfo.Payload["data"]); if err != nil { panic(err) }
		// [Unmarshal] Payload Data Json -> actionsMap Map
		var actionsMap map[string]interface{}
		if err := json.Unmarshal(jsonBytes, &actionsMap); err != nil { panic(err) }
		// [Marshal] actionsMap Map -> actionsSlice Json
		jsonBytes, err = json.Marshal(actionsMap["actions"]); if err != nil { panic(err) }
		// [Unmarshal] actionsSlice Json -> actionsSlice Slice
		var actionsSlice []interface{}
		if err = json.Unmarshal(jsonBytes, &actionsSlice); err != nil { panic(err) }
		
		for _, action := range actionsSlice {
			// Actions Slice -> Actions Slice Json
			jsonBytes, err = json.Marshal(action); if err != nil { panic(err) }
			// Actions Slice Json -> ActionsSliceInfo Struct
			var actionsSliceInfo ActionsSliceInfo
			if err := json.Unmarshal(jsonBytes, &actionsSliceInfo); err != nil { panic(err) }
			// ActionsSliceInfo Struct -> Payload' Action Json
			jsonBytes, err = json.Marshal(actionsSliceInfo.Payload["action"]); if err != nil { panic(err) }
			// Payload' Action Json -> PayloadActionInfo Struct
			var payloadActionInfo PayloadActionInfo
			if err := json.Unmarshal(jsonBytes, &payloadActionInfo); err != nil { panic(err) }
			// PayloadActionInfo Struct -> Proposal_response_payload Extension Json
			jsonBytes, err = json.Marshal(payloadActionInfo.Proposal_response_payload["extension"]); if err != nil { panic(err) }
			// Proposal_response_payload Extension Json -> Proposal_response_payloadExtensionInfo Struct
			var proposal_response_payloadExtensionInfo Proposal_response_payloadExtensionInfo
			if err := json.Unmarshal(jsonBytes, &proposal_response_payloadExtensionInfo); err != nil { panic(err) }
			// Proposal_response_payloadExtensionInfo Struct -> Ns_rwset Json
			jsonBytes, err = json.Marshal(proposal_response_payloadExtensionInfo.Results["ns_rwset"]); if err != nil { panic(err) }
			// Ns_rwset Json -> ns_rwsetSlice Slice
			var ns_rwsetSlice []interface{}
			if err = json.Unmarshal(jsonBytes, &ns_rwsetSlice); err != nil { panic(err) }

			for _, rwset := range ns_rwsetSlice {
				// ns_rwsetSlice -> ns_rwset Json
				jsonBytes, err = json.Marshal(rwset); if err != nil { panic(err) }
				// ns_rwset Json -> Ns_rwsetSliceInfo Struct
				var ns_rwsetSliceInfo Ns_rwsetSliceInfo
				if err := json.Unmarshal(jsonBytes, &ns_rwsetSliceInfo); err != nil { panic(err) }
				
				if chaincodeName := ns_rwsetSliceInfo.Namespace; chaincodeName != CHAINCODENAME { continue }
				// Ns_rwsetSliceInfo Struct -> Writes Json
				jsonBytes, err = json.Marshal(ns_rwsetSliceInfo.Rwset["writes"]); if err != nil { panic(err) }
				// Writes Json -> writesSlice Slice
				var writesSlice []interface{}
				if err := json.Unmarshal(jsonBytes, &writesSlice); err != nil { panic(err) }

				for _, write := range writesSlice {
					// writesSlice -> Write Json
					jsonBytes, err = json.Marshal(write); if err != nil { panic(err) }
					
					var writeInfo WriteInfo
					if err := json.Unmarshal(jsonBytes, &writeInfo); err != nil { panic(err) }

					////////////////////////////////////
					// writeInfo.Is_delete:boolean
					// writeInfo.Key:string		
					// writeInfo.Value:value ( base64 )	 
					////////////////////////////////////
					valueDecode, _ := base64.StdEncoding.DecodeString(writeInfo.Value)
					file.WriteString("{\"write\":\"generated\"}\n")
					if writeInfo.Is_delete == false {
						file.WriteString("{\"is_delete\":\"false\",")
					} else {
						file.WriteString("{\"is_delete\":\"true\",")
					}
					file.WriteString("\"key\":\""+ writeInfo.Key +"\",")
					file.WriteString("\"value\":\""+ string(valueDecode) +"\"}\n")
				}
			}

		}
	}
	file.Close()
}
