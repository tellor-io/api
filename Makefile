include .bingo/Variables.mk

.PHONY: generate
generate:
	@$(CONTRAGET) --addr=0x88dF592F8eb5D7Bd38bFeF7dEb0fBc02cf3778a0 --download-dst=tmp --abi-dst=contracts --name=tellorMaster
	@sleep 5
	@$(CONTRAGET) --addr=0x269A6B2357267E27BF8F358f18FE0ab3938C5d0F --download-dst=tmp --abi-dst=contracts --name=tellorLens