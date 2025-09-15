#!/bin/bash

# ControlIT Backup Script
# This script performs manual backups and can be scheduled via cron

set -e  # Exit on any error

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
PROJECT_DIR="$(dirname "$SCRIPT_DIR")"
BACKUP_DIR="${PROJECT_DIR}/backups"

# Load environment variables if .env exists
if [ -f "${PROJECT_DIR}/.env" ]; then
    export $(grep -v '^#' "${PROJECT_DIR}/.env" | xargs)
fi

# Create backup directory if it doesn't exist
mkdir -p "$BACKUP_DIR"

echo "🔄 Starting ControlIT backup process..."
echo "📁 Backup directory: $BACKUP_DIR"

# Function to create timestamp
get_timestamp() {
    date +"%Y%m%d_%H%M%S"
}

# Function to create compressed backup
create_backup() {
    local source="$1"
    local name="$2"
    local timestamp=$(get_timestamp)
    local backup_file="${BACKUP_DIR}/${name}_backup_${timestamp}.tar.gz"

    if [ -e "$source" ]; then
        echo "📦 Creating $name backup..."
        tar -czf "$backup_file" -C "$(dirname "$source")" "$(basename "$source")" 2>/dev/null
        if [ $? -eq 0 ]; then
            echo "✅ $name backup created: $(basename "$backup_file")"
            echo "$backup_file"
        else
            echo "❌ Failed to create $name backup"
            return 1
        fi
    else
        echo "⚠️  $name source not found: $source"
        return 1
    fi
}

# Function to verify backup
verify_backup() {
    local backup_file="$1"
    local name="$2"

    echo "🔍 Verifying $name backup..."
    if tar -tzf "$backup_file" >/dev/null 2>&1; then
        echo "✅ $name backup verified successfully"
        return 0
    else
        echo "❌ $name backup verification failed"
        return 1
    fi
}

# Function to cleanup old backups
cleanup_old_backups() {
    local max_backups="${BACKUP_MAX_COUNT:-7}"
    local backup_type="$1"

    echo "🧹 Cleaning up old $backup_type backups (keeping $max_backups)..."

    local files=($(ls -t "${BACKUP_DIR}/${backup_type}_backup_"*.tar.gz 2>/dev/null || true))

    if [ ${#files[@]} -gt $max_backups ]; then
        local files_to_delete=(${files[@]:$max_backups})
        for file in "${files_to_delete[@]}"; do
            rm -f "$file"
            echo "🗑️  Deleted old backup: $(basename "$file")"
        done
        echo "✅ Cleaned up $(( ${#files_to_delete[@]} )) old $backup_type backups"
    else
        echo "ℹ️  No old $backup_type backups to clean up"
    fi
}

# Main backup process
BACKUP_RESULTS=()
ERRORS=()

# Backup configuration files
CONFIG_FILES=(
    ".env"
    ".env.test"
    ".env.example"
    "config.js"
    "package.json"
    "package-lock.json"
    "jest.config.js"
    "docker-compose.yml"
    "Dockerfile"
)

# Create temporary directory for config files
CONFIG_TMP="${BACKUP_DIR}/config_tmp"
mkdir -p "$CONFIG_TMP"

# Copy config files to temporary directory
for file in "${CONFIG_FILES[@]}"; do
    if [ -f "${PROJECT_DIR}/$file" ]; then
        cp "${PROJECT_DIR}/$file" "$CONFIG_TMP/"
    fi
done

if [ -d "$CONFIG_TMP" ] && [ "$(ls -A $CONFIG_TMP)" ]; then
    CONFIG_BACKUP=$(create_backup "$CONFIG_TMP" "config")
    if [ $? -eq 0 ] && [ -n "$CONFIG_BACKUP" ]; then
        verify_backup "$CONFIG_BACKUP" "config"
        BACKUP_RESULTS+=("$CONFIG_BACKUP")
    else
        ERRORS+=("Config backup failed")
    fi
else
    echo "⚠️  No configuration files found to backup"
fi

# Clean up temporary directory
rm -rf "$CONFIG_TMP"

# Backup logs directory
if [ -d "${PROJECT_DIR}/logs" ]; then
    LOGS_BACKUP=$(create_backup "${PROJECT_DIR}/logs" "logs")
    if [ $? -eq 0 ] && [ -n "$LOGS_BACKUP" ]; then
        verify_backup "$LOGS_BACKUP" "logs"
        BACKUP_RESULTS+=("$LOGS_BACKUP")
    else
        ERRORS+=("Logs backup failed")
    fi
else
    echo "⚠️  Logs directory not found, skipping logs backup"
fi

# Backup monitoring directory
if [ -d "${PROJECT_DIR}/monitoring" ]; then
    MONITORING_BACKUP=$(create_backup "${PROJECT_DIR}/monitoring" "monitoring")
    if [ $? -eq 0 ] && [ -n "$MONITORING_BACKUP" ]; then
        verify_backup "$MONITORING_BACKUP" "monitoring"
        BACKUP_RESULTS+=("$MONITORING_BACKUP")
    else
        ERRORS+=("Monitoring backup failed")
    fi
else
    echo "⚠️  Monitoring directory not found, skipping monitoring backup"
fi

# Cleanup old backups
cleanup_old_backups "config"
cleanup_old_backups "logs"
cleanup_old_backups "monitoring"

# Summary
echo ""
echo "📊 Backup Summary:"
echo "=================="
echo "✅ Successful backups: ${#BACKUP_RESULTS[@]}"
for backup in "${BACKUP_RESULTS[@]}"; do
    echo "   📁 $(basename "$backup") ($(du -h "$backup" | cut -f1))"
done

if [ ${#ERRORS[@]} -gt 0 ]; then
    echo ""
    echo "❌ Errors: ${#ERRORS[@]}"
    for error in "${ERRORS[@]}"; do
        echo "   🚨 $error"
    done
    echo ""
    echo "⚠️  Backup completed with errors"
    exit 1
else
    echo ""
    echo "🎉 All backups completed successfully!"
fi

echo ""
echo "📈 Backup Statistics:"
echo "====================="
echo "📁 Total backup files: $(ls -1 "$BACKUP_DIR"/*.tar.gz 2>/dev/null | wc -l)"
echo "💾 Total backup size: $(du -sh "$BACKUP_DIR" 2>/dev/null | cut -f1 || echo "0")"
echo "📅 Latest backup: $(ls -t "$BACKUP_DIR"/*.tar.gz 2>/dev/null | head -1 | xargs basename || echo "None")"