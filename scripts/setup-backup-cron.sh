#!/bin/bash

# Setup automated backups using cron
# This script adds the backup script to crontab for daily execution

set -e

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
PROJECT_DIR="$(dirname "$SCRIPT_DIR")"
BACKUP_SCRIPT="${SCRIPT_DIR}/backup.sh"

# Check if backup script exists and is executable
if [ ! -x "$BACKUP_SCRIPT" ]; then
    echo "❌ Backup script not found or not executable: $BACKUP_SCRIPT"
    exit 1
fi

# Default cron schedule (daily at 2 AM)
CRON_SCHEDULE="${CRON_SCHEDULE:-0 2 * * *}"

# Create cron job entry
CRON_JOB="$CRON_SCHEDULE $BACKUP_SCRIPT >> ${PROJECT_DIR}/logs/backup.log 2>&1"

echo "🔧 Setting up automated backup cron job..."
echo "📅 Schedule: $CRON_SCHEDULE"
echo "📝 Command: $BACKUP_SCRIPT"
echo ""

# Check if cron job already exists
if crontab -l 2>/dev/null | grep -q "$BACKUP_SCRIPT"; then
    echo "⚠️  Backup cron job already exists. Updating..."

    # Remove existing backup cron job
    crontab -l 2>/dev/null | grep -v "$BACKUP_SCRIPT" | crontab -
fi

# Add new cron job
(crontab -l 2>/dev/null; echo "$CRON_JOB") | crontab -

echo "✅ Backup cron job added successfully!"
echo ""
echo "📋 Current cron jobs:"
crontab -l
echo ""
echo "📝 Backup logs will be written to: ${PROJECT_DIR}/logs/backup.log"
echo ""
echo "🔍 To view backup logs: tail -f ${PROJECT_DIR}/logs/backup.log"
echo "🛑 To remove cron job: crontab -r (removes all cron jobs)"
echo ""
echo "💡 You can customize the backup schedule by setting CRON_SCHEDULE environment variable"
echo "   Examples:"
echo "   - Daily at 2 AM: CRON_SCHEDULE='0 2 * * *'"
echo "   - Every 6 hours: CRON_SCHEDULE='0 */6 * * *'"
echo "   - Weekly on Sunday: CRON_SCHEDULE='0 2 * * 0'"