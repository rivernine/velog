package main

import (
	"encoding/base64"
	"encoding/json"
	"fmt"
	"io/ioutil"
)
//
//	---- Block ----
//		data {}
//			data []
//				payload {}
//					data {}
//						actions []
//							payload {}
//								action {}
//									proposal_response_payload {}
//										extension {}
//											result {}
//												ns_rwset []
//													rwset {}
//														writes []
//															is_delete bool
//															key		  string
//															value     string(base64)
//
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

var CHAINCODENAME = "mycc"

func main() {
	// Json
	/*
	jsonBytes := []byte(`{
		"data": {
			"data": [
				{
					"payload": {
						"data": {
							"actions": [
								{
									"header": {
										"creator": {
											"id_bytes": "LS0tLS1CRUdJTiBDRVJUSUZJQ0FURS0tLS0tCk1JSUNLakNDQWRHZ0F3SUJBZ0lSQU1xTVJqTDJLQ0w0cmZnRHpVL3ZxWDh3Q2dZSUtvWkl6ajBFQXdJd2N6RUwKTUFrR0ExVUVCaE1DVlZNeEV6QVJCZ05WQkFnVENrTmhiR2xtYjNKdWFXRXhGakFVQmdOVkJBY1REVk5oYmlCRwpjbUZ1WTJselkyOHhHVEFYQmdOVkJBb1RFRzl5WnpJdVpYaGhiWEJzWlM1amIyMHhIREFhQmdOVkJBTVRFMk5oCkxtOXlaekl1WlhoaGJYQnNaUzVqYjIwd0hoY05NVGt3TmpJNE1EY3lPREF3V2hjTk1qa3dOakkxTURjeU9EQXcKV2pCc01Rc3dDUVlEVlFRR0V3SlZVekVUTUJFR0ExVUVDQk1LUTJGc2FXWnZjbTVwWVRFV01CUUdBMVVFQnhNTgpVMkZ1SUVaeVlXNWphWE5qYnpFUE1BMEdBMVVFQ3hNR1kyeHBaVzUwTVI4d0hRWURWUVFEREJaQlpHMXBia0J2CmNtY3lMbVY0WVcxd2JHVXVZMjl0TUZrd0V3WUhLb1pJemowQ0FRWUlLb1pJemowREFRY0RRZ0FFeWltSE9URSsKSDgxVFY0TDZwUE5ZeFVveVcwRjFTVm5IYlYycytKdzNoNmtmL2t5RFdzTmRBSmVuT0hmZDJNODdTaDdmdVoyUAp1eUc0S09KZmtOUk0yYU5OTUVzd0RnWURWUjBQQVFIL0JBUURBZ2VBTUF3R0ExVWRFd0VCL3dRQ01BQXdLd1lEClZSMGpCQ1F3SW9BZ1RPSUpkQmF0dkgyNUZsSkVUNVJIT2NhbHQ4UHJCanVvUXNpQ240MXl0OE13Q2dZSUtvWkkKemowRUF3SURSd0F3UkFJZ0o4WUVxU1pDZWw4SDVwTGJLMDFrZ001WFJJZ2pNTmU2QU94cTVyZkQ5T29DSUVRagpMclhDUkg1VGZiR0hTK0ZQUnFiRXlIOUFEclNNQVpFOEpwVVFZOFNECi0tLS0tRU5EIENFUlRJRklDQVRFLS0tLS0K",
											"mspid": "Org2MSP"
										},
										"nonce": "TylgD6UXKSBpT2QXEAzjZimZ8zS0nkZT"
									},
									"payload": {
										"action": {
											"endorsements": [
												{
													"endorser": "CgdPcmcxTVNQEqoGLS0tLS1CRUdJTiBDRVJUSUZJQ0FURS0tLS0tCk1JSUNLRENDQWM2Z0F3SUJBZ0lRR2cvU2VsY1E3aFRhUGtEREdWWERKVEFLQmdncWhrak9QUVFEQWpCek1Rc3cKQ1FZRFZRUUdFd0pWVXpFVE1CRUdBMVVFQ0JNS1EyRnNhV1p2Y201cFlURVdNQlFHQTFVRUJ4TU5VMkZ1SUVaeQpZVzVqYVhOamJ6RVpNQmNHQTFVRUNoTVFiM0puTVM1bGVHRnRjR3hsTG1OdmJURWNNQm9HQTFVRUF4TVRZMkV1CmIzSm5NUzVsZUdGdGNHeGxMbU52YlRBZUZ3MHhPVEEyTWpnd056STRNREJhRncweU9UQTJNalV3TnpJNE1EQmEKTUdveEN6QUpCZ05WQkFZVEFsVlRNUk13RVFZRFZRUUlFd3BEWVd4cFptOXlibWxoTVJZd0ZBWURWUVFIRXcxVApZVzRnUm5KaGJtTnBjMk52TVEwd0N3WURWUVFMRXdSd1pXVnlNUjh3SFFZRFZRUURFeFp3WldWeU1DNXZjbWN4CkxtVjRZVzF3YkdVdVkyOXRNRmt3RXdZSEtvWkl6ajBDQVFZSUtvWkl6ajBEQVFjRFFnQUVVRG5wVnBGYkZXeWcKWVowcTFCM0tFZXNGa2tQRitINzg4L3MvcmJXQlpDdndWeTh1SVk2MFR0cnRHb2gwNnFud0hSR1Z4OTNKMGVIOAprTnBJTGVZQXphTk5NRXN3RGdZRFZSMFBBUUgvQkFRREFnZUFNQXdHQTFVZEV3RUIvd1FDTUFBd0t3WURWUjBqCkJDUXdJb0FnQ0t0NlVvcVNVSldjWlh6eGdzdzNZak0vbmhzSWpOaWd6bk1ubnJwQWtva3dDZ1lJS29aSXpqMEUKQXdJRFNBQXdSUUloQU9wdjNlSllreTJiTXM3WndzQnBxRVpNOFpwYmQ5SEduMDYyZDg5cDNXcVVBaUJ0UEIraAowYmV6WklyK3N4VlgvYWJCRzM4RDZYV0tsY0U2UEovcmJCTlc2UT09Ci0tLS0tRU5EIENFUlRJRklDQVRFLS0tLS0K",
													"signature": "MEUCIQC2eVnCfPpYuBoEu91caASnZyG+dQ4r7GPziJTLSMbdhwIgOHnd9+3r5IcW0LkfHazUqUaR2UQUVd3UqgWFZMSjpKI="
												},
												{
													"endorser": "CgdPcmcyTVNQEqoGLS0tLS1CRUdJTiBDRVJUSUZJQ0FURS0tLS0tCk1JSUNLVENDQWMrZ0F3SUJBZ0lSQU5OYkg3OHZpZld6cER6NlQ2LzArV293Q2dZSUtvWkl6ajBFQXdJd2N6RUwKTUFrR0ExVUVCaE1DVlZNeEV6QVJCZ05WQkFnVENrTmhiR2xtYjNKdWFXRXhGakFVQmdOVkJBY1REVk5oYmlCRwpjbUZ1WTJselkyOHhHVEFYQmdOVkJBb1RFRzl5WnpJdVpYaGhiWEJzWlM1amIyMHhIREFhQmdOVkJBTVRFMk5oCkxtOXlaekl1WlhoaGJYQnNaUzVqYjIwd0hoY05NVGt3TmpJNE1EY3lPREF3V2hjTk1qa3dOakkxTURjeU9EQXcKV2pCcU1Rc3dDUVlEVlFRR0V3SlZVekVUTUJFR0ExVUVDQk1LUTJGc2FXWnZjbTVwWVRFV01CUUdBMVVFQnhNTgpVMkZ1SUVaeVlXNWphWE5qYnpFTk1Bc0dBMVVFQ3hNRWNHVmxjakVmTUIwR0ExVUVBeE1XY0dWbGNqQXViM0puCk1pNWxlR0Z0Y0d4bExtTnZiVEJaTUJNR0J5cUdTTTQ5QWdFR0NDcUdTTTQ5QXdFSEEwSUFCTUJod3N3NXRTVVIKMHVpNy9aY1RUZHloVGV0cUpCRVlzUUdJTTJQak13YlNNM1ZiM1F6WFk4b0tWZjZoQVF1ZjVjcGdvVmxTSHBrVQpiVFhiS1JZOWt3cWpUVEJMTUE0R0ExVWREd0VCL3dRRUF3SUhnREFNQmdOVkhSTUJBZjhFQWpBQU1Dc0dBMVVkCkl3UWtNQ0tBSUV6aUNYUVdyYng5dVJaU1JFK1VSem5HcGJmRDZ3WTdxRUxJZ3ArTmNyZkRNQW9HQ0NxR1NNNDkKQkFNQ0EwZ0FNRVVDSVFDajAyazNGUktsNm9yRzlvQ0xYUzdPT2pMZUdVK25DUlE4cUZ0SGhCQzBWZ0lnZHA1awpPd2JNeVFrdERYRXBFblN1Y0dJbDJIc0phRzJrS3lBV0dxeHltd2c9Ci0tLS0tRU5EIENFUlRJRklDQVRFLS0tLS0K",
													"signature": "MEQCIFNvLN96bAxJzfHnkZNCA7YyCslVEHBT9UxPd0LW3+3dAiAEVKVK5ic2wy1S+RM8y0iGaThtzaXEDM/DOMLPoeiwFw=="
												}
											],
											"proposal_response_payload": {
												"extension": {
													"chaincode_id": {
														"name": "mycc",
														"path": "",
														"version": "1.0"
													},
													"events": null,
													"response": {
														"message": "",
														"payload": null,
														"status": 200
													},
													"results": {
														"data_model": "KV",
														"ns_rwset": [
															{
																"collection_hashed_rwset": [],
																"namespace": "lscc",
																"rwset": {
																	"metadata_writes": [],
																	"range_queries_info": [],
																	"reads": [
																		{
																			"key": "mycc",
																			"version": {
																				"block_num": "3",
																				"tx_num": "0"
																			}
																		}
																	],
																	"writes": []
																}
															},
															{
																"collection_hashed_rwset": [],
																"namespace": "mycc",
																"rwset": {
																	"metadata_writes": [],
																	"range_queries_info": [],
																	"reads": [
																		{
																			"key": "a",
																			"version": {
																				"block_num": "3",
																				"tx_num": "0"
																			}
																		},
																		{
																			"key": "b",
																			"version": {
																				"block_num": "3",
																				"tx_num": "0"
																			}
																		}
																	],
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
																}
															}
														]
													},
													"token_expectation": null
												},
												"proposal_hash": "rng9HQKKAxY3Z4Qd4Pua2Tuy98tIAN5yJzoeoVxsGK4="
											}
										},
										"chaincode_proposal_payload": {
											"TransientMap": {},
											"input": {
												"chaincode_spec": {
													"chaincode_id": {
														"name": "mycc",
														"path": "",
														"version": ""
													},
													"input": {
														"args": [
															"aW52b2tl",
															"YQ==",
															"Yg==",
															"MTA="
														],
														"decorations": {}
													},
													"timeout": 0,
													"type": "GOLANG"
												}
											}
										}
									}
								}
							]
						},
						"header": {
							"channel_header": {
								"channel_id": "mychannel",
								"epoch": "0",
								"extension": "EgYSBG15Y2M=",
								"timestamp": "2019-07-08T01:12:10.811253842Z",
								"tls_cert_hash": null,
								"tx_id": "d7c49eeefc8d287c3c35df34841c198ce3c3e41d5485b226cbe2f178e8bd38e9",
								"type": 3,
								"version": 0
							},
							"signature_header": {
								"creator": {
									"id_bytes": "LS0tLS1CRUdJTiBDRVJUSUZJQ0FURS0tLS0tCk1JSUNLakNDQWRHZ0F3SUJBZ0lSQU1xTVJqTDJLQ0w0cmZnRHpVL3ZxWDh3Q2dZSUtvWkl6ajBFQXdJd2N6RUwKTUFrR0ExVUVCaE1DVlZNeEV6QVJCZ05WQkFnVENrTmhiR2xtYjNKdWFXRXhGakFVQmdOVkJBY1REVk5oYmlCRwpjbUZ1WTJselkyOHhHVEFYQmdOVkJBb1RFRzl5WnpJdVpYaGhiWEJzWlM1amIyMHhIREFhQmdOVkJBTVRFMk5oCkxtOXlaekl1WlhoaGJYQnNaUzVqYjIwd0hoY05NVGt3TmpJNE1EY3lPREF3V2hjTk1qa3dOakkxTURjeU9EQXcKV2pCc01Rc3dDUVlEVlFRR0V3SlZVekVUTUJFR0ExVUVDQk1LUTJGc2FXWnZjbTVwWVRFV01CUUdBMVVFQnhNTgpVMkZ1SUVaeVlXNWphWE5qYnpFUE1BMEdBMVVFQ3hNR1kyeHBaVzUwTVI4d0hRWURWUVFEREJaQlpHMXBia0J2CmNtY3lMbVY0WVcxd2JHVXVZMjl0TUZrd0V3WUhLb1pJemowQ0FRWUlLb1pJemowREFRY0RRZ0FFeWltSE9URSsKSDgxVFY0TDZwUE5ZeFVveVcwRjFTVm5IYlYycytKdzNoNmtmL2t5RFdzTmRBSmVuT0hmZDJNODdTaDdmdVoyUAp1eUc0S09KZmtOUk0yYU5OTUVzd0RnWURWUjBQQVFIL0JBUURBZ2VBTUF3R0ExVWRFd0VCL3dRQ01BQXdLd1lEClZSMGpCQ1F3SW9BZ1RPSUpkQmF0dkgyNUZsSkVUNVJIT2NhbHQ4UHJCanVvUXNpQ240MXl0OE13Q2dZSUtvWkkKemowRUF3SURSd0F3UkFJZ0o4WUVxU1pDZWw4SDVwTGJLMDFrZ001WFJJZ2pNTmU2QU94cTVyZkQ5T29DSUVRagpMclhDUkg1VGZiR0hTK0ZQUnFiRXlIOUFEclNNQVpFOEpwVVFZOFNECi0tLS0tRU5EIENFUlRJRklDQVRFLS0tLS0K",
									"mspid": "Org2MSP"
								},
								"nonce": "TylgD6UXKSBpT2QXEAzjZimZ8zS0nkZT"
							}
						}
					},
					"signature": "MEQCIEMsmGw9XrTv3pvPjktV0+e1/CJWQNbbZz2IFruNZH+tAiAPDc/4oUhdsIwjEILjgqqXh03b8ZYOxpRQQGKENE4h+g=="
				}, 
				{
					"payload": {
						"data": {
							"actions": [
								{
									"header": {
										"creator": {
											"id_bytes": "LS0tLS1CRUdJTiBDRVJUSUZJQ0FURS0tLS0tCk1JSUNLakNDQWRHZ0F3SUJBZ0lSQU1xTVJqTDJLQ0w0cmZnRHpVL3ZxWDh3Q2dZSUtvWkl6ajBFQXdJd2N6RUwKTUFrR0ExVUVCaE1DVlZNeEV6QVJCZ05WQkFnVENrTmhiR2xtYjNKdWFXRXhGakFVQmdOVkJBY1REVk5oYmlCRwpjbUZ1WTJselkyOHhHVEFYQmdOVkJBb1RFRzl5WnpJdVpYaGhiWEJzWlM1amIyMHhIREFhQmdOVkJBTVRFMk5oCkxtOXlaekl1WlhoaGJYQnNaUzVqYjIwd0hoY05NVGt3TmpJNE1EY3lPREF3V2hjTk1qa3dOakkxTURjeU9EQXcKV2pCc01Rc3dDUVlEVlFRR0V3SlZVekVUTUJFR0ExVUVDQk1LUTJGc2FXWnZjbTVwWVRFV01CUUdBMVVFQnhNTgpVMkZ1SUVaeVlXNWphWE5qYnpFUE1BMEdBMVVFQ3hNR1kyeHBaVzUwTVI4d0hRWURWUVFEREJaQlpHMXBia0J2CmNtY3lMbVY0WVcxd2JHVXVZMjl0TUZrd0V3WUhLb1pJemowQ0FRWUlLb1pJemowREFRY0RRZ0FFeWltSE9URSsKSDgxVFY0TDZwUE5ZeFVveVcwRjFTVm5IYlYycytKdzNoNmtmL2t5RFdzTmRBSmVuT0hmZDJNODdTaDdmdVoyUAp1eUc0S09KZmtOUk0yYU5OTUVzd0RnWURWUjBQQVFIL0JBUURBZ2VBTUF3R0ExVWRFd0VCL3dRQ01BQXdLd1lEClZSMGpCQ1F3SW9BZ1RPSUpkQmF0dkgyNUZsSkVUNVJIT2NhbHQ4UHJCanVvUXNpQ240MXl0OE13Q2dZSUtvWkkKemowRUF3SURSd0F3UkFJZ0o4WUVxU1pDZWw4SDVwTGJLMDFrZ001WFJJZ2pNTmU2QU94cTVyZkQ5T29DSUVRagpMclhDUkg1VGZiR0hTK0ZQUnFiRXlIOUFEclNNQVpFOEpwVVFZOFNECi0tLS0tRU5EIENFUlRJRklDQVRFLS0tLS0K",
											"mspid": "Org2MSP"
										},
										"nonce": "TylgD6UXKSBpT2QXEAzjZimZ8zS0nkZT"
									},
									"payload": {
										"action": {
											"endorsements": [
												{
													"endorser": "CgdPcmcxTVNQEqoGLS0tLS1CRUdJTiBDRVJUSUZJQ0FURS0tLS0tCk1JSUNLRENDQWM2Z0F3SUJBZ0lRR2cvU2VsY1E3aFRhUGtEREdWWERKVEFLQmdncWhrak9QUVFEQWpCek1Rc3cKQ1FZRFZRUUdFd0pWVXpFVE1CRUdBMVVFQ0JNS1EyRnNhV1p2Y201cFlURVdNQlFHQTFVRUJ4TU5VMkZ1SUVaeQpZVzVqYVhOamJ6RVpNQmNHQTFVRUNoTVFiM0puTVM1bGVHRnRjR3hsTG1OdmJURWNNQm9HQTFVRUF4TVRZMkV1CmIzSm5NUzVsZUdGdGNHeGxMbU52YlRBZUZ3MHhPVEEyTWpnd056STRNREJhRncweU9UQTJNalV3TnpJNE1EQmEKTUdveEN6QUpCZ05WQkFZVEFsVlRNUk13RVFZRFZRUUlFd3BEWVd4cFptOXlibWxoTVJZd0ZBWURWUVFIRXcxVApZVzRnUm5KaGJtTnBjMk52TVEwd0N3WURWUVFMRXdSd1pXVnlNUjh3SFFZRFZRUURFeFp3WldWeU1DNXZjbWN4CkxtVjRZVzF3YkdVdVkyOXRNRmt3RXdZSEtvWkl6ajBDQVFZSUtvWkl6ajBEQVFjRFFnQUVVRG5wVnBGYkZXeWcKWVowcTFCM0tFZXNGa2tQRitINzg4L3MvcmJXQlpDdndWeTh1SVk2MFR0cnRHb2gwNnFud0hSR1Z4OTNKMGVIOAprTnBJTGVZQXphTk5NRXN3RGdZRFZSMFBBUUgvQkFRREFnZUFNQXdHQTFVZEV3RUIvd1FDTUFBd0t3WURWUjBqCkJDUXdJb0FnQ0t0NlVvcVNVSldjWlh6eGdzdzNZak0vbmhzSWpOaWd6bk1ubnJwQWtva3dDZ1lJS29aSXpqMEUKQXdJRFNBQXdSUUloQU9wdjNlSllreTJiTXM3WndzQnBxRVpNOFpwYmQ5SEduMDYyZDg5cDNXcVVBaUJ0UEIraAowYmV6WklyK3N4VlgvYWJCRzM4RDZYV0tsY0U2UEovcmJCTlc2UT09Ci0tLS0tRU5EIENFUlRJRklDQVRFLS0tLS0K",
													"signature": "MEUCIQC2eVnCfPpYuBoEu91caASnZyG+dQ4r7GPziJTLSMbdhwIgOHnd9+3r5IcW0LkfHazUqUaR2UQUVd3UqgWFZMSjpKI="
												},
												{
													"endorser": "CgdPcmcyTVNQEqoGLS0tLS1CRUdJTiBDRVJUSUZJQ0FURS0tLS0tCk1JSUNLVENDQWMrZ0F3SUJBZ0lSQU5OYkg3OHZpZld6cER6NlQ2LzArV293Q2dZSUtvWkl6ajBFQXdJd2N6RUwKTUFrR0ExVUVCaE1DVlZNeEV6QVJCZ05WQkFnVENrTmhiR2xtYjNKdWFXRXhGakFVQmdOVkJBY1REVk5oYmlCRwpjbUZ1WTJselkyOHhHVEFYQmdOVkJBb1RFRzl5WnpJdVpYaGhiWEJzWlM1amIyMHhIREFhQmdOVkJBTVRFMk5oCkxtOXlaekl1WlhoaGJYQnNaUzVqYjIwd0hoY05NVGt3TmpJNE1EY3lPREF3V2hjTk1qa3dOakkxTURjeU9EQXcKV2pCcU1Rc3dDUVlEVlFRR0V3SlZVekVUTUJFR0ExVUVDQk1LUTJGc2FXWnZjbTVwWVRFV01CUUdBMVVFQnhNTgpVMkZ1SUVaeVlXNWphWE5qYnpFTk1Bc0dBMVVFQ3hNRWNHVmxjakVmTUIwR0ExVUVBeE1XY0dWbGNqQXViM0puCk1pNWxlR0Z0Y0d4bExtTnZiVEJaTUJNR0J5cUdTTTQ5QWdFR0NDcUdTTTQ5QXdFSEEwSUFCTUJod3N3NXRTVVIKMHVpNy9aY1RUZHloVGV0cUpCRVlzUUdJTTJQak13YlNNM1ZiM1F6WFk4b0tWZjZoQVF1ZjVjcGdvVmxTSHBrVQpiVFhiS1JZOWt3cWpUVEJMTUE0R0ExVWREd0VCL3dRRUF3SUhnREFNQmdOVkhSTUJBZjhFQWpBQU1Dc0dBMVVkCkl3UWtNQ0tBSUV6aUNYUVdyYng5dVJaU1JFK1VSem5HcGJmRDZ3WTdxRUxJZ3ArTmNyZkRNQW9HQ0NxR1NNNDkKQkFNQ0EwZ0FNRVVDSVFDajAyazNGUktsNm9yRzlvQ0xYUzdPT2pMZUdVK25DUlE4cUZ0SGhCQzBWZ0lnZHA1awpPd2JNeVFrdERYRXBFblN1Y0dJbDJIc0phRzJrS3lBV0dxeHltd2c9Ci0tLS0tRU5EIENFUlRJRklDQVRFLS0tLS0K",
													"signature": "MEQCIFNvLN96bAxJzfHnkZNCA7YyCslVEHBT9UxPd0LW3+3dAiAEVKVK5ic2wy1S+RM8y0iGaThtzaXEDM/DOMLPoeiwFw=="
												}
											],
											"proposal_response_payload": {
												"extension": {
													"chaincode_id": {
														"name": "mycc",
														"path": "",
														"version": "1.0"
													},
													"events": null,
													"response": {
														"message": "",
														"payload": null,
														"status": 200
													},
													"results": {
														"data_model": "KV",
														"ns_rwset": [
															{
																"collection_hashed_rwset": [],
																"namespace": "lscc",
																"rwset": {
																	"metadata_writes": [],
																	"range_queries_info": [],
																	"reads": [
																		{
																			"key": "mycc",
																			"version": {
																				"block_num": "3",
																				"tx_num": "0"
																			}
																		}
																	],
																	"writes": []
																}
															},
															{
																"collection_hashed_rwset": [],
																"namespace": "mycc",
																"rwset": {
																	"metadata_writes": [],
																	"range_queries_info": [],
																	"reads": [
																		{
																			"key": "a",
																			"version": {
																				"block_num": "3",
																				"tx_num": "0"
																			}
																		},
																		{
																			"key": "b",
																			"version": {
																				"block_num": "3",
																				"tx_num": "0"
																			}
																		}
																	],
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
																}
															}
														]
													},
													"token_expectation": null
												},
												"proposal_hash": "rng9HQKKAxY3Z4Qd4Pua2Tuy98tIAN5yJzoeoVxsGK4="
											}
										},
										"chaincode_proposal_payload": {
											"TransientMap": {},
											"input": {
												"chaincode_spec": {
													"chaincode_id": {
														"name": "mycc",
														"path": "",
														"version": ""
													},
													"input": {
														"args": [
															"aW52b2tl",
															"YQ==",
															"Yg==",
															"MTA="
														],
														"decorations": {}
													},
													"timeout": 0,
													"type": "GOLANG"
												}
											}
										}
									}
								}
							]
						},
						"header": {
							"channel_header": {
								"channel_id": "mychannel",
								"epoch": "0",
								"extension": "EgYSBG15Y2M=",
								"timestamp": "2019-07-08T01:12:10.811253842Z",
								"tls_cert_hash": null,
								"tx_id": "d7c49eeefc8d287c3c35df34841c198ce3c3e41d5485b226cbe2f178e8bd38e9",
								"type": 3,
								"version": 0
							},
							"signature_header": {
								"creator": {
									"id_bytes": "LS0tLS1CRUdJTiBDRVJUSUZJQ0FURS0tLS0tCk1JSUNLakNDQWRHZ0F3SUJBZ0lSQU1xTVJqTDJLQ0w0cmZnRHpVL3ZxWDh3Q2dZSUtvWkl6ajBFQXdJd2N6RUwKTUFrR0ExVUVCaE1DVlZNeEV6QVJCZ05WQkFnVENrTmhiR2xtYjNKdWFXRXhGakFVQmdOVkJBY1REVk5oYmlCRwpjbUZ1WTJselkyOHhHVEFYQmdOVkJBb1RFRzl5WnpJdVpYaGhiWEJzWlM1amIyMHhIREFhQmdOVkJBTVRFMk5oCkxtOXlaekl1WlhoaGJYQnNaUzVqYjIwd0hoY05NVGt3TmpJNE1EY3lPREF3V2hjTk1qa3dOakkxTURjeU9EQXcKV2pCc01Rc3dDUVlEVlFRR0V3SlZVekVUTUJFR0ExVUVDQk1LUTJGc2FXWnZjbTVwWVRFV01CUUdBMVVFQnhNTgpVMkZ1SUVaeVlXNWphWE5qYnpFUE1BMEdBMVVFQ3hNR1kyeHBaVzUwTVI4d0hRWURWUVFEREJaQlpHMXBia0J2CmNtY3lMbVY0WVcxd2JHVXVZMjl0TUZrd0V3WUhLb1pJemowQ0FRWUlLb1pJemowREFRY0RRZ0FFeWltSE9URSsKSDgxVFY0TDZwUE5ZeFVveVcwRjFTVm5IYlYycytKdzNoNmtmL2t5RFdzTmRBSmVuT0hmZDJNODdTaDdmdVoyUAp1eUc0S09KZmtOUk0yYU5OTUVzd0RnWURWUjBQQVFIL0JBUURBZ2VBTUF3R0ExVWRFd0VCL3dRQ01BQXdLd1lEClZSMGpCQ1F3SW9BZ1RPSUpkQmF0dkgyNUZsSkVUNVJIT2NhbHQ4UHJCanVvUXNpQ240MXl0OE13Q2dZSUtvWkkKemowRUF3SURSd0F3UkFJZ0o4WUVxU1pDZWw4SDVwTGJLMDFrZ001WFJJZ2pNTmU2QU94cTVyZkQ5T29DSUVRagpMclhDUkg1VGZiR0hTK0ZQUnFiRXlIOUFEclNNQVpFOEpwVVFZOFNECi0tLS0tRU5EIENFUlRJRklDQVRFLS0tLS0K",
									"mspid": "Org2MSP"
								},
								"nonce": "TylgD6UXKSBpT2QXEAzjZimZ8zS0nkZT"
							}
						}
					},
					"signature": "MEQCIEMsmGw9XrTv3pvPjktV0+e1/CJWQNbbZz2IFruNZH+tAiAPDc/4oUhdsIwjEILjgqqXh03b8ZYOxpRQQGKENE4h+g=="
				}
			]
		},
		"header": {
			"data_hash": "sH95QbJISryoYr/j3OgKootmjUT4++zA/kAvUADf5ms=",
			"number": "4",
			"previous_hash": "j/n4UuMJDDKkJJujm47zlLL8a5hPSXXmK/WrpqHVi1Q="
		},
		"metadata": {
			"metadata": [
				"EvgGCq0GCpAGCgpPcmRlcmVyTVNQEoEGLS0tLS1CRUdJTiBDRVJUSUZJQ0FURS0tLS0tCk1JSUNERENDQWJPZ0F3SUJBZ0lSQVBXSEIxOWdNZ0x1VnpUMnNsNkdqOHd3Q2dZSUtvWkl6ajBFQXdJd2FURUwKTUFrR0ExVUVCaE1DVlZNeEV6QVJCZ05WQkFnVENrTmhiR2xtYjNKdWFXRXhGakFVQmdOVkJBY1REVk5oYmlCRwpjbUZ1WTJselkyOHhGREFTQmdOVkJBb1RDMlY0WVcxd2JHVXVZMjl0TVJjd0ZRWURWUVFERXc1allTNWxlR0Z0CmNHeGxMbU52YlRBZUZ3MHhPVEEyTWpnd056STRNREJhRncweU9UQTJNalV3TnpJNE1EQmFNRmd4Q3pBSkJnTlYKQkFZVEFsVlRNUk13RVFZRFZRUUlFd3BEWVd4cFptOXlibWxoTVJZd0ZBWURWUVFIRXcxVFlXNGdSbkpoYm1OcApjMk52TVJ3d0dnWURWUVFERXhOdmNtUmxjbVZ5TG1WNFlXMXdiR1V1WTI5dE1Ga3dFd1lIS29aSXpqMENBUVlJCktvWkl6ajBEQVFjRFFnQUVPUnp4N2g2VmJKYXlzOHZrKzZRUzhnZW1BWjk0YzBNOGdMelg4d2tuNDAybmszVUsKa2Nxc0wyanFkNTZrZ2ROOEFaN3ZVK05UNnlvN1lzUHlITklJbDZOTk1Fc3dEZ1lEVlIwUEFRSC9CQVFEQWdlQQpNQXdHQTFVZEV3RUIvd1FDTUFBd0t3WURWUjBqQkNRd0lvQWdUOGUwbVF1NVVlOWtQNG5WRFNoUkFveGlOaTMrClhaa25MOVU3QzU1cFE4Z3dDZ1lJS29aSXpqMEVBd0lEUndBd1JBSWdPWUZpb2xmMituUCtTdUFxLzNDT2w4R2gKSVUvbHVVQlZyNCs1bTRFaHZLVUNJSEd2YjFpYldRR3Bod0EwZkQ1Q0NERW5aVjFZcnJmZ3RKZWxkb0E2cnZKNgotLS0tLUVORCBDRVJUSUZJQ0FURS0tLS0tChIYQDZaEX+TQucCNxrMZzgSMIQxsEp/2vf1EkYwRAIgDxE8dnt+JjSu49EWo9ms0gZ3UEteu1tauzzwZQJECcQCIBy2DULNKqrj0WamN6C5WA+C1nAJsrLMbif011y9Xozi",
				"CgIIAhL5BgqtBgqQBgoKT3JkZXJlck1TUBKBBi0tLS0tQkVHSU4gQ0VSVElGSUNBVEUtLS0tLQpNSUlDRERDQ0FiT2dBd0lCQWdJUkFQV0hCMTlnTWdMdVZ6VDJzbDZHajh3d0NnWUlLb1pJemowRUF3SXdhVEVMCk1Ba0dBMVVFQmhNQ1ZWTXhFekFSQmdOVkJBZ1RDa05oYkdsbWIzSnVhV0V4RmpBVUJnTlZCQWNURFZOaGJpQkcKY21GdVkybHpZMjh4RkRBU0JnTlZCQW9UQzJWNFlXMXdiR1V1WTI5dE1SY3dGUVlEVlFRREV3NWpZUzVsZUdGdApjR3hsTG1OdmJUQWVGdzB4T1RBMk1qZ3dOekk0TURCYUZ3MHlPVEEyTWpVd056STRNREJhTUZneEN6QUpCZ05WCkJBWVRBbFZUTVJNd0VRWURWUVFJRXdwRFlXeHBabTl5Ym1saE1SWXdGQVlEVlFRSEV3MVRZVzRnUm5KaGJtTnAKYzJOdk1Sd3dHZ1lEVlFRREV4TnZjbVJsY21WeUxtVjRZVzF3YkdVdVkyOXRNRmt3RXdZSEtvWkl6ajBDQVFZSQpLb1pJemowREFRY0RRZ0FFT1J6eDdoNlZiSmF5czh2ays2UVM4Z2VtQVo5NGMwTThnTHpYOHdrbjQwMm5rM1VLCmtjcXNMMmpxZDU2a2dkTjhBWjd2VStOVDZ5bzdZc1B5SE5JSWw2Tk5NRXN3RGdZRFZSMFBBUUgvQkFRREFnZUEKTUF3R0ExVWRFd0VCL3dRQ01BQXdLd1lEVlIwakJDUXdJb0FnVDhlMG1RdTVVZTlrUDRuVkRTaFJBb3hpTmkzKwpYWmtuTDlVN0M1NXBROGd3Q2dZSUtvWkl6ajBFQXdJRFJ3QXdSQUlnT1lGaW9sZjIrblArU3VBcS8zQ09sOEdoCklVL2x1VUJWcjQrNW00RWh2S1VDSUhHdmIxaWJXUUdwaHdBMGZENUNDREVuWlYxWXJyZmd0SmVsZG9BNnJ2SjYKLS0tLS1FTkQgQ0VSVElGSUNBVEUtLS0tLQoSGN1o9mQ4kPkTAvSFTt/NMu3sDups+07FbRJHMEUCIQCPSLilY70wvhOmpjw9726PvtWpsgHDqa0Ey8wMELqFzQIgYNCdrnBIYoLwsUqzAGvD8+xVMg0x9imoYgEmv9dbo48=",
				"AA==",
				""
			]
		}
	}`)
	*/


	jsonBytes, err := ioutil.ReadFile("./blockhistory.log"); if err != nil { panic(err) }
	fmt.Println(string(jsonBytes))


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
					fmt.Println(writeInfo.Is_delete)
					fmt.Println(writeInfo.Key)
					valueDecode, _ := base64.StdEncoding.DecodeString(writeInfo.Value)
					fmt.Println(string(valueDecode))
					
				}
			}

		}
	}

}