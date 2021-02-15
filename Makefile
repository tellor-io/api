include .bingo/Variables.mk

.PHONY: generate
generate:
	@$(CONTRAGET) --addr=0xFe41Cb708CD98C5B20423433309E55b53F79134a --download-dst=tmp --abi-dst=contracts --name=tellorMaster
	@sleep 5 #Etherscan allows one request per 5 sec without an api key.
	@$(CONTRAGET) --addr=0xf4b8e33c3fe68ebd80b551adebe860ed12da4723 --download-dst=tmp --abi-dst=contracts --name=tellorCurrent
	@sleep 5
	@$(CONTRAGET) --addr=0xDa6e9baf899D88adc4d0c955AA60f392306db82A --download-dst=tmp --abi-dst=contracts --name=tellorLens