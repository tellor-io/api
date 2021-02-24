include .bingo/Variables.mk

.PHONY: generate
generate:
	@$(CONTRAGET) --addr=0x04b5129735b5d9b1b54109f2c4c06ea23b506a95 --download-dst=tmp --abi-dst=contracts --name=tellorMaster
	@sleep 5
	@$(CONTRAGET) --addr=0x8FEC3e4171C446B4c4d2C798a87D679933Fa5cCD --download-dst=tmp --abi-dst=contracts --name=tellorLens