default: build

.PHONY: run
run:
	cargo run


.PHONY: release
release:
	cargo build --release
