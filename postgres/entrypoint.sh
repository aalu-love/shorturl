#!/bin/bash

# PostgreSQL entrypoint script with automatic cleanup, initialization, and replica bootstrap
# Handles fresh init, normal restarts, and replica base backup.

set -e

PGDATA="${PGDATA:-/var/lib/postgresql/data}"
PRIMARY_HOST="${PRIMARY_HOST:-postgres-primary}"
PRIMARY_PORT="${PRIMARY_PORT:-5432}"
PRIMARY_USER="${PRIMARY_USER:-repuser}"
PRIMARY_PASSWORD="${PRIMARY_PASSWORD:-password}"
REPLICA_MODE="${REPLICA_MODE:-false}"
DEVELOPMENT="${DEVELOPMENT:-false}"

echo "======================================"
echo "PostgreSQL Auto Entrypoint"
echo "PGDATA: $PGDATA"
echo "REPLICA_MODE: $REPLICA_MODE"
echo "DEVELOPMENT: $DEVELOPMENT"
echo "PRIMARY_HOST: $PRIMARY_HOST"
echo "PRIMARY_PORT: $PRIMARY_PORT"
echo "PRIMARY_USER: $PRIMARY_USER"
echo "======================================"

run_as_postgres() {
    if command -v su-exec >/dev/null 2>&1; then
        su-exec postgres "$@"
    elif command -v gosu >/dev/null 2>&1; then
        gosu postgres "$@"
    elif command -v runuser >/dev/null 2>&1; then
        runuser -u postgres -- "$@"
    else
        echo "WARNING: no su-exec/gosu/runuser found; running as root"
        "$@"
    fi
}

# Fix permissions automatically
echo "→ Ensuring correct permissions on PGDATA..."
mkdir -p "$PGDATA"
chmod 700 "$PGDATA" 2>/dev/null || true
chown -R postgres:postgres "$PGDATA" 2>/dev/null || true

is_initialized() {
    [ -f "$PGDATA/PG_VERSION" ]
}

cleanup_pgdata() {
    if [ -n "$(ls -A "$PGDATA" 2>/dev/null)" ]; then
        echo "→ Cleaning up stale or corrupted data in PGDATA..."
        find "$PGDATA" -mindepth 1 -delete
    fi
}

bootstrap_replica() {
    echo "→ Bootstrap replica from primary $PRIMARY_HOST:$PRIMARY_PORT"
    cleanup_pgdata

    export PGPASSWORD="$PRIMARY_PASSWORD"
    run_as_postgres pg_basebackup \
        -h "$PRIMARY_HOST" \
        -p "$PRIMARY_PORT" \
        -U "$PRIMARY_USER" \
        -D "$PGDATA" \
        -Fp -Xs -P

    echo "→ Creating standby.signal"
    touch "$PGDATA/standby.signal"
    chmod 700 "$PGDATA"
    chown -R postgres:postgres "$PGDATA"
}

if [ "$DEVELOPMENT" = "true" ] || [ "$DEVELOPMENT" = "1" ]; then
    echo "🔧 DEVELOPMENT MODE DETECTED"
    echo "→ Forcefully cleaning up PGDATA for fresh initialization..."
    cleanup_pgdata
    echo "→ Running full initialization in development mode..."
    exec docker-entrypoint.sh "$@"
fi

if is_initialized; then
    echo "✓ PostgreSQL is already initialized"
    if [ -f "$PGDATA/postmaster.pid" ]; then
        echo "⚠ Unclean shutdown detected (postmaster.pid found)"
        echo "→ Removing stale postmaster.pid..."
        rm -f "$PGDATA/postmaster.pid"
    fi

    # For primary, ensure replication user exists
    if [ "$REPLICA_MODE" != "true" ] && [ "$REPLICA_MODE" != "1" ]; then
        echo "→ Checking/creating replication user..."
        # Start postgres temporarily
        run_as_postgres pg_ctl -D "$PGDATA" -o "-c listen_addresses='localhost' -c unix_socket_directories=/tmp" -w start >/dev/null 2>&1 || true
        sleep 2
        run_as_postgres psql -h /tmp -d postgres -c "DO \$\$ BEGIN IF NOT EXISTS (SELECT 1 FROM pg_roles WHERE rolname = '$PRIMARY_USER') THEN CREATE USER $PRIMARY_USER WITH REPLICATION PASSWORD '$PRIMARY_PASSWORD'; END IF; END \$\$;" 2>/dev/null || true
        run_as_postgres pg_ctl -D "$PGDATA" -m fast -w stop >/dev/null 2>&1 || true
    fi

    echo "→ Starting PostgreSQL server as postgres user..."
    exec docker-entrypoint.sh "$@"
fi

if [ "$REPLICA_MODE" = "true" ] || [ "$REPLICA_MODE" = "1" ]; then
    echo "✗ Replica mode detected and PGDATA is not initialized"
    bootstrap_replica
    echo "→ Starting replica PostgreSQL server as postgres user..."
    exec docker-entrypoint.sh "$@"
fi

# Fresh init on primary (or non-replica service)
echo "✗ PostgreSQL not initialized"
echo "→ Running full initialization..."
exec docker-entrypoint.sh "$@"