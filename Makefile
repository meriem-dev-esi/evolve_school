# Evolve Academy — website
#
# `make` with no argument prints this list. Every target you need day to day is
# here, so nobody has to remember whether it was `pnpm check` or `pnpm verify`.

.PHONY: help setup dev build ci-local lint fix typecheck guards clean

help: ## Show this help
	@grep -E '^[a-zA-Z_-]+:.*?## .*$$' $(MAKEFILE_LIST) | sort | \
	  awk 'BEGIN {FS = ":.*?## "}; {printf "\033[36m%-12s\033[0m %s\n", $$1, $$2}'

setup: ## First-time setup: install dependencies and check the environment
	pnpm install
	@test -f .env.local || (echo "⚠️  Create .env.local from .env.example" && exit 1)
	@echo "Setup complete. Run 'make dev'."

dev: ## Run the development server on http://localhost:3000
	pnpm dev

build: ## Production build — what CI and Vercel run
	pnpm build

ci-local: ## Everything CI runs, locally, in about a minute. Run before every push.
	@bash scripts/local_ci.sh

guards: ## Just the fast greps (secrets, boundaries, tokens, size)
	@bash scripts/secret_guard.sh
	@bash scripts/boundary_guard.sh
	@bash scripts/design_token_guard.sh
	@bash scripts/component_size_guard.sh

lint: ## Check formatting and lint rules
	pnpm lint

fix: ## Fix what can be fixed automatically
	pnpm lint:fix

typecheck: ## TypeScript, no emit
	pnpm typecheck

clean: ## Remove build artifacts
	rm -rf .next out node_modules/.cache
