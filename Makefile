include .bingo/Variables.mk

.PHONY: generate
generate:
	@$(CONTRAGET) --addr=0x04b5129735b5d9b1b54109f2c4c06ea23b506a95 --download-dst=tmp --abi-dst=contracts --name=tellorMaster
	@sleep 5
	@$(CONTRAGET) --addr=0xea8260126324cA104F3454aFe2fB9eA188fdB555 --download-dst=tmp --abi-dst=contracts --name=tellorLens