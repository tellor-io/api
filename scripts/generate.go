// Copyright (c) The Tellor Authors.
// Licensed under the MIT License.

package main

import (
	"log"
	"path/filepath"
	"time"

	"github.com/nanmu42/etherscan-api"
	"github.com/tellor-io/telliot/pkg/bindings"
)

func main() {
	log.SetFlags(log.Ltime | log.Lshortfile | log.Lmsgprefix)

	downlContractsFolder := filepath.Join("contracts")

	// Bindings for the oracle proxy.
	downloadAndGenerate("0x0Ba45A8b5d5575935B8158a88C631E9F9C95a2e5", downlContractsFolder, "tellorProxy")
	time.Sleep(5 * time.Second)

	// Bindings for the oracle master.
	downloadAndGenerate("0xc5721b1b753b0e2129f88694762c718c36442e7c", downlContractsFolder, "tellorMaster")
	time.Sleep(5 * time.Second)

	// Bindings for the oracle lens.
	downloadAndGenerate("0xB3b7C09e1501FE212b58eEE9915DA625706eea95", downlContractsFolder, "tellorLens")
}
func downloadAndGenerate(addr, downlContractsFolder, name string) {
	downloadFolder := filepath.Join(downlContractsFolder, name)

	filePaths, err := bindings.DownloadContracts(etherscan.Mainnet, addr, downloadFolder, name)
	ExitOnErr(err, "download contracts")

	for path := range filePaths {
		log.Printf("Downloaded contract:%+v", path)
	}

	_, abis, _, _, _, err := bindings.GetContractObjects(filePaths)
	ExitOnErr(err, "get contracts object")

	err = bindings.GenerateABI(downloadFolder, name, abis)
	ExitOnErr(err, "generate ABI")
	log.Println("Generated ABI:", filepath.Join(downloadFolder, name))

}

func ExitOnErr(err error, msg string) {
	if err != nil {
		log.Fatalf("execution error:%+v msg:%+v", err, msg)
	}
}
