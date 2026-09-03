# ── URL Shortener — Makefile ───────────────────────────────────────────────
.PHONY: help up down restart logs shell db-shell redis-shell migrate seed \
        test lint clean ps

# Default target
help:
	@echo ""
	@echo "  URL Shortener — Dev Commands"
	@echo ""
	@echo "  make up          Start all services (detached)"
	@echo "  make down        Stop all services"
	@echo "  make restart     Restart the app container only"
	@echo "  make logs        Tail logs from all services"
	@echo "  make logs-app    Tail app logs only"
	@echo "  make ps          Show running containers"
	@echo ""
	@echo "  make shell       Open shell inside app container"
	@echo "  make db-shell    Open psql on primary DB"
	@echo "  make redis-cli   Open redis-cli"
	@echo ""
	@echo "  make migrate     Re-run schema SQL on primary"
	@echo "  make seed        Run seed SQL"
	@echo "  make test        Run test suite"
	@echo "  make clean       Stop and remove all volumes (destructive!)"
	@echo ""

# ── Docker lifecycle ───────────────────────────────────────────────────────

up:
	@cp -n .env.example .env 2>/dev/null || true
	docker compose up -d --build
	@echo ""
	@echo "  Services running:"
	@echo "  API    →  http://localhost/api/v1"
	@echo "  Health →  http://localhost/health"
	@echo ""

down:
	docker compose down

restart:
	docker compose restart app

logs:
	docker compose logs -f

logs-app:
	docker compose logs -f app

logs-db:
	docker compose logs -f postgres-primary

logs-redis:
	docker compose logs -f redis

ps:
	docker compose ps

# ── Database ───────────────────────────────────────────────────────────────

db-shell:
	docker compose exec postgres-primary psql -U postgres -d urlshortener

db-shell-replica:
	docker compose exec postgres-replica psql -U postgres -d urlshortener

migrate:
	docker compose exec postgres-primary psql -U postgres -d urlshortener \
		-f /docker-entrypoint-initdb.d/01_schema.sql
	@echo "Schema applied."

seed:
	docker compose exec postgres-primary psql -U postgres -d urlshortener \
		-f /docker-entrypoint-initdb.d/02_seed.sql
	@echo "Seed data inserted."

# ── Redis ──────────────────────────────────────────────────────────────────

redis-cli:
	docker compose exec redis redis-cli -a redis_secret

redis-flush:
	docker compose exec redis redis-cli -a redis_secret FLUSHALL
	@echo "Redis cache cleared."

redis-info:
	docker compose exec redis redis-cli -a redis_secret INFO memory

# ── App ────────────────────────────────────────────────────────────────────

shell:
	docker compose exec app sh

# ── Tests ─────────────────────────────────────────────────────────────────

test:
	docker compose exec app npm test

# ── Cleanup ────────────────────────────────────────────────────────────────

clean:
	@echo "WARNING: This will delete all data volumes."
	@read -p "Are you sure? [y/N] " confirm && [ "$$confirm" = "y" ]
	docker compose down -v
	@echo "All containers and volumes removed."
