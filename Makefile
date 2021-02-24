include .bingo/Variables.mk

.PHONY: generate
generate:
	@$(CONTRAGET) --addr=0x04b5129735b5d9b1b54109f2c4c06ea23b506a95 --download-dst=tmp --abi-dst=contracts --name=tellorMaster
	@sleep 5
	@$(CONTRAGET) --addr=0x75E086578eDD643199517532E5206d1f47869d4d --download-dst=tmp --abi-dst=contracts --name=tellorLens