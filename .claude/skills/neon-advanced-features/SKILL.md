---
name: Neon Advanced Features - Snapshots and Point-in-Time Restore
description: Master Neon's advanced features including snapshots, point-in-time restore, backup management, and instant restoration. Learn how to use Time Travel, branch from specific points in time, restore branches, and manage backups. Use when implementing backup strategies, using point-in-time restore, creating snapshots, restoring from specific points in time, managing backup retention, using Time Travel, and implementing disaster recovery.
---

# Neon Advanced Features - Snapshots and Point-in-Time Restore

## Understanding Neon's Backup Architecture

### Storage and Backup Mechanism
- **Copy-on-Write**: Neon uses copy-on-write to efficiently store multiple versions of data
- **Continuous Backup**: All changes are continuously backed up without interruption
- **WAL Streaming**: Write-Ahead Log (WAL) is streamed to durable storage
- **Multi-Tenant Storage**: Shared storage infrastructure with isolation
- **Point-in-Time Recovery Window**: Time window during which you can restore to any point

### Backup Retention Policy
- **Automatic Backups**: Continuous, automatic backups of all changes
- **Retention Periods**: Configurable based on your plan (typically 7-30 days)
- **Branch-Aware**: Each branch maintains its own backup timeline
- **Incremental Backups**: Only changed pages are backed up, reducing storage costs

## Snapshots and Branching

### Creating Snapshots
Snapshots in Neon are essentially branches created from a specific point in time. There are two ways to think about snapshots:

1. **Branch as Snapshot**: Creating a branch at any point serves as a snapshot
2. **Timeline Snapshots**: Using the timeline feature to create point-in-time branches

```bash
# Create a branch as a snapshot from current state
neonctl branches create --project-id your-project-id --name backup-snapshot-$(date +%Y%m%d)

# Create a branch from a specific point in time (timeline feature)
# This is done via the Neon Console or API
```

### Branch Creation from Timeline
```python
# Using Neon API to create branch from specific timestamp
import requests
from datetime import datetime

def create_branch_from_timestamp(project_id, parent_branch_id, branch_name, timestamp, api_key):
    """
    Create a branch from a specific point in time
    """
    headers = {
        'Authorization': f'Bearer {api_key}',
        'Content-Type': 'application/json'
    }

    payload = {
        'branch': {
            'name': branch_name,
            'parent_id': parent_branch_id,
            'parent_lsn': None,  # Will be calculated based on timestamp
            'timeline_timestamp': timestamp  # ISO format: 2023-01-15T10:30:00Z
        }
    }

    response = requests.post(
        f'https://console.neon.tech/api/v2/projects/{project_id}/branches',
        headers=headers,
        json=payload
    )

    return response.json()
```

## Point-in-Time Restore (PITR)

### Understanding Restore Window
- **Restore Window**: Time period from which you can restore (varies by plan)
- **Continuous Recovery**: Can restore to any point within the window
- **No Downtime**: Restores happen without affecting the original branch
- **Instant Creation**: Branches from past points are created instantly

### Using the Timeline Feature
The Neon Console provides a timeline slider that allows you to:
- Visualize the history of your database
- Select specific points in time
- Create branches from any point in the timeline
- View schema and data changes over time

### Programmatic Point-in-Time Recovery
```python
# Example: Restore to specific point in time
import requests
from datetime import datetime, timedelta

def restore_to_point_in_time(project_id, source_branch_id, restore_timestamp, api_key):
    """
    Restore database to a specific point in time by creating a new branch
    """
    headers = {
        'Authorization': f'Bearer {api_key}',
        'Content-Type': 'application/json'
    }

    # Create a new branch from the specific point in time
    branch_payload = {
        'branch': {
            'name': f'restore-{restore_timestamp.replace(":", "-").replace(" ", "_T_")}',
            'parent_id': source_branch_id,
            'timeline_timestamp': restore_timestamp
        }
    }

    response = requests.post(
        f'https://console.neon.tech/api/v2/projects/{project_id}/branches',
        headers=headers,
        json=branch_payload
    )

    if response.status_code == 201:
        branch_info = response.json()
        print(f"Restored to {restore_timestamp}, new branch: {branch_info['branch']['name']}")
        return branch_info
    else:
        print(f"Failed to restore: {response.status_code} - {response.text}")
        return None
```

## Time Travel Feature

### Using Time Travel in Neon
Time Travel is Neon's feature that allows you to query data as it existed at a specific point in time:

1. **Via Neon Console**: Use the timeline feature to select points in time
2. **Via SQL Editor**: Query branches created from specific timestamps
3. **Via Connection Strings**: Connect to branches created at specific times

### Time Travel Use Cases
```sql
-- Example: Query data as it existed yesterday
-- First, create a branch from yesterday's data via Neon Console or API
-- Then connect to that branch to query the historical data

-- In the historical branch:
SELECT * FROM users WHERE created_at > '2023-01-01' AND created_at < '2023-01-02';
```

### Time Travel for Data Analysis
```python
# Example: Compare data between different points in time
def compare_data_over_time(project_id, base_branch, comparison_points, api_key):
    """
    Create branches from different time points and compare data
    """
    branches_created = []

    for point in comparison_points:
        branch_info = create_branch_from_timestamp(
            project_id=project_id,
            parent_branch_id=base_branch['id'],
            branch_name=f"data_comparison_{point}",
            timestamp=point,
            api_key=api_key
        )
        branches_created.append(branch_info)

    # Now you can connect to each branch and compare data
    # This is useful for analytics, trend analysis, and debugging
    return branches_created
```

## Backup Management

### Automatic Backup Configuration
Neon handles backups automatically, but you can configure aspects like:

1. **Branch Retention**: How long branch data is kept
2. **Snapshot Frequency**: How often snapshots are taken
3. **Backup Storage**: Management of backup storage costs

### Backup Verification
```python
# Example: Verify backup integrity by creating test branches
def verify_backup_integrity(project_id, branch_id, api_key):
    """
    Verify backup integrity by creating a temporary branch and testing it
    """
    import uuid

    # Create a temporary branch for testing
    test_branch_name = f"backup-test-{uuid.uuid4().hex[:8]}"

    test_branch = create_branch_from_timestamp(
        project_id=project_id,
        parent_branch_id=branch_id,
        branch_name=test_branch_name,
        timestamp=datetime.utcnow().isoformat() + "Z",  # Current time
        api_key=api_key
    )

    if test_branch:
        # Connect to the test branch and run basic queries
        # This verifies the branch (backup) is functional
        print(f"Backup verification branch created: {test_branch_name}")

        # Clean up: Delete the test branch
        delete_branch(project_id, test_branch['branch']['id'], api_key)
        print(f"Verification branch {test_branch_name} deleted")

        return True

    return False
```

### Backup Retention Policies
```python
# Example: Implement backup retention based on business requirements
def implement_retention_policy(project_id, api_key):
    """
    Implement backup retention based on business requirements:
    - Hourly backups for last 24 hours
    - Daily backups for last 30 days
    - Weekly backups for last year
    """
    import datetime

    now = datetime.datetime.utcnow()

    # Create snapshots based on retention policy
    snapshots_to_create = []

    # Hourly snapshots for last 24 hours
    for i in range(24):
        snapshot_time = now - datetime.timedelta(hours=i)
        snapshots_to_create.append({
            'name': f'hourly-{snapshot_time.strftime("%Y%m%d-%H")}',
            'timestamp': snapshot_time.isoformat() + 'Z'
        })

    # Daily snapshots for last 30 days
    for i in range(1, 31):  # Skip today (already covered by hourly)
        snapshot_time = now - datetime.timedelta(days=i)
        snapshots_to_create.append({
            'name': f'daily-{snapshot_time.strftime("%Y%m%d")}',
            'timestamp': snapshot_time.isoformat() + 'Z'
        })

    # Create the snapshots
    for snapshot in snapshots_to_create:
        create_branch_from_timestamp(
            project_id=project_id,
            parent_branch_id='br-production-123',  # Replace with actual branch ID
            branch_name=snapshot['name'],
            timestamp=snapshot['timestamp'],
            api_key=api_key
        )
```

## Instant Restore Capabilities

### Instant Restore Process
Neon's instant restore works differently than traditional databases:

1. **No Data Copying**: Branches are created instantly using copy-on-write
2. **Shared Storage**: Data is shared until changes are made
3. **Immediate Availability**: Restored branches are immediately accessible
4. **Cost Effective**: Only pays for changes made after the restore point

### Disaster Recovery with Instant Restore
```python
# Example: Disaster recovery procedure
def disaster_recovery_procedure(project_id, affected_branch_id, recovery_time, api_key):
    """
    Perform disaster recovery by creating a recovery branch from a safe point in time
    """
    print(f"Starting disaster recovery for branch {affected_branch_id}")

    # Step 1: Create recovery branch from safe point in time
    recovery_branch = create_branch_from_timestamp(
        project_id=project_id,
        parent_branch_id=affected_branch_id,
        branch_name=f'dr-recovery-{recovery_time.replace(":", "-").replace(" ", "_")}',
        timestamp=recovery_time,
        api_key=api_key
    )

    if not recovery_branch:
        print("Failed to create recovery branch")
        return None

    print(f"Recovery branch created: {recovery_branch['branch']['name']}")

    # Step 2: Verify the recovered data
    # (Implementation would connect to the branch and run verification queries)

    # Step 3: If verification passes, the recovery branch can be used
    # Or you can copy the data back to the original branch after fixing the issue

    return recovery_branch
```

## Schema Diff and Change Tracking

### Using Schema Diff for Recovery
Neon provides schema diff capabilities that help with:
- Understanding changes between different points in time
- Verifying that a point-in-time restore will have the expected schema
- Tracking schema evolution over time

### Schema Change Analysis
```python
# Example: Track schema changes over time
def analyze_schema_changes(project_id, branch_id, time_intervals, api_key):
    """
    Create branches at different time points and compare schemas
    """
    branches = []

    for interval in time_intervals:
        branch = create_branch_from_timestamp(
            project_id=project_id,
            parent_branch_id=branch_id,
            branch_name=f'schema-analysis-{interval}',
            timestamp=interval,
            api_key=api_key
        )
        branches.append(branch)

    # Compare schemas between branches
    # This would involve connecting to each branch and running schema introspection queries
    schema_changes = []

    for i in range(len(branches)-1):
        current_branch = branches[i]['branch']['name']
        next_branch = branches[i+1]['branch']['name']

        # Compare schemas (implementation would connect to both and compare)
        changes = compare_schemas(current_branch, next_branch)
        schema_changes.append({
            'from': branches[i]['branch']['timeline_timestamp'],
            'to': branches[i+1]['branch']['timeline_timestamp'],
            'changes': changes
        })

    return schema_changes
```

## Advanced Backup Strategies

### Multi-Region Backup Strategy
```python
# Example: Cross-region backup strategy
def cross_region_backup_strategy(primary_project_id, secondary_region_project_id, api_key):
    """
    Implement cross-region backup by creating branches in different regions
    """
    # Get primary branch information
    primary_branches = list_project_branches(primary_project_id, api_key)

    for branch in primary_branches:
        if branch['name'] == 'production':
            # Create a copy in the secondary region
            # This would typically be done by exporting and importing
            # or by setting up logical replication between regions

            # For Neon, you might export the branch and import to another region
            print(f"Setting up cross-region backup for branch: {branch['name']}")

            # Implementation would depend on Neon's cross-region capabilities
            # which might involve using pg_dump/pg_restore or other tools
```

### Compliance and Audit Backup Strategy
```python
# Example: Compliance-oriented backup strategy
def compliance_backup_strategy(project_id, api_key):
    """
    Implement backup strategy for compliance requirements:
    - Immutable backups for legal hold
    - Regular backup verification
    - Audit trail of backup operations
    """

    # Create immutable snapshots at regular intervals
    compliance_snapshots = [
        {'interval': 'daily', 'retention': '7 years', 'name_pattern': 'compliance-daily'},
        {'interval': 'weekly', 'retention': '7 years', 'name_pattern': 'compliance-weekly'},
        {'interval': 'monthly', 'retention': '7 years', 'name_pattern': 'compliance-monthly'}
    ]

    for snap_config in compliance_snapshots:
        # Create snapshot based on compliance requirements
        snapshot_name = f"{snap_config['name_pattern']}-{datetime.datetime.utcnow().strftime('%Y%m')}"

        # Create branch for compliance snapshot
        compliance_branch = create_branch_from_timestamp(
            project_id=project_id,
            parent_branch_id='production-branch-id',  # Actual production branch ID
            branch_name=snapshot_name,
            timestamp=datetime.datetime.utcnow().isoformat() + 'Z',
            api_key=api_key
        )

        print(f"Created compliance snapshot: {compliance_branch['branch']['name']}")

        # Tag for compliance management
        tag_branch_for_compliance(compliance_branch['branch']['id'], snap_config['retention'], api_key)
```

## Backup Automation and Scheduling

### Automated Backup Scripts
```python
# Example: Automated backup scheduler
import schedule
import time
from datetime import datetime

def automated_backup_scheduler():
    """
    Schedule automated backups based on frequency requirements
    """

    # Daily backup at 2 AM
    schedule.every().day.at("02:00").do(create_daily_backup)

    # Weekly backup every Sunday at 1 AM
    schedule.every().sunday.at("01:00").do(create_weekly_backup)

    # Monthly backup on the 1st of each month at midnight
    schedule.every().month.do(create_monthly_backup)

    while True:
        schedule.run_pending()
        time.sleep(3600)  # Check every hour

def create_daily_backup():
    """
    Create daily backup branch
    """
    branch_name = f"daily-backup-{datetime.now().strftime('%Y%m%d')}"
    # Implementation to create branch via Neon API
    pass

def create_weekly_backup():
    """
    Create weekly backup branch
    """
    branch_name = f"weekly-backup-{datetime.now().strftime('%Y%U')}"
    # Implementation to create branch via Neon API
    pass

def create_monthly_backup():
    """
    Create monthly backup branch
    """
    branch_name = f"monthly-backup-{datetime.now().strftime('%Y%m')}"
    # Implementation to create branch via Neon API
    pass
```

## Troubleshooting Backup and Restore Issues

### Common Issues and Solutions

#### Issue: Restore Point Outside Window
- **Symptom**: Cannot restore to a specific point in time
- **Cause**: Requested time is outside the backup retention window
- **Solution**: Restore to the earliest available point or implement longer retention

#### Issue: Branch Creation Fails During Restore
- **Symptom**: Creating a branch from a specific timestamp fails
- **Cause**: Possible API rate limits or temporary service issues
- **Solution**: Retry with exponential backoff or check service status

#### Issue: Slow Query Performance on Historical Branches
- **Symptom**: Queries on restored branches are slower than expected
- **Cause**: Historical data may not have the same indexing as current data
- **Solution**: Analyze and optimize indexes on historical branches

### Backup Verification Scripts
```python
# Example: Backup verification script
def verify_backup_chain(project_id, branch_id, api_key):
    """
    Verify that backup chain is intact and restorable
    """
    try:
        # Test creating a branch from a recent point in time
        test_time = (datetime.datetime.utcnow() - datetime.timedelta(minutes=5)).isoformat() + 'Z'

        test_branch = create_branch_from_timestamp(
            project_id=project_id,
            parent_branch_id=branch_id,
            branch_name='backup-verification-test',
            timestamp=test_time,
            api_key=api_key
        )

        if test_branch:
            print("✓ Recent backup point is accessible")

            # Clean up test branch
            delete_branch(project_id, test_branch['branch']['id'], api_key)
            print("✓ Test branch cleaned up")

            return True
        else:
            print("✗ Could not create branch from recent point")
            return False

    except Exception as e:
        print(f"✗ Backup verification failed: {str(e)}")
        return False
```

## Integration with Monitoring and Alerting

### Backup Status Monitoring
```python
# Example: Monitor backup status and send alerts
def monitor_backup_status(project_id, api_key):
    """
    Monitor backup status and trigger alerts for issues
    """
    import smtplib

    # Check if recent backups are being created
    recent_branches = get_recent_branches(project_id, hours=24, api_key=api_key)

    backup_frequency_issues = []

    # Check if expected backups exist
    expected_daily_backup = datetime.datetime.utcnow().strftime('%Y%m%d')
    has_daily_backup = any(expected_daily_backup in branch['name'] for branch in recent_branches)

    if not has_daily_backup:
        backup_frequency_issues.append(f"No daily backup found for {expected_daily_backup}")

    # Send alert if issues found
    if backup_frequency_issues:
        alert_message = "Backup monitoring alert:\n" + "\n".join(backup_frequency_issues)
        send_alert(alert_message, 'backup-alerts@company.com')

        return False

    print("✓ Backup monitoring: All systems nominal")
    return True

def send_alert(message, recipient):
    """
    Send alert via email or other notification system
    """
    # Implementation for sending alerts
    pass
```

## Best Practices for Advanced Features

### Point-in-Time Recovery Best Practices
- **Frequent Testing**: Regularly test your recovery procedures
- **Documentation**: Document your recovery procedures clearly
- **Verification**: Always verify data integrity after recovery
- **Communication**: Have clear communication plans for recovery incidents

### Backup Strategy Best Practices
- **3-2-1 Rule**: 3 copies of data, on 2 different media, with 1 offsite
- **Regular Testing**: Test restores regularly, not just backups
- **Monitoring**: Continuously monitor backup success/failure
- **Documentation**: Document retention policies and procedures

### Performance Considerations
- **Indexing**: Maintain appropriate indexes on historical branches
- **Connection Management**: Use appropriate connection settings for historical data
- **Query Optimization**: Optimize queries for historical data analysis

## Quick Reference

### Common Commands for Advanced Features
```bash
# Create branch from specific timestamp via CLI
neonctl branches create --project-id <proj-id> --name <branch-name> --parent-id <parent-id> --timeline-timestamp "2023-01-01T10:00:00Z"

# List branches to see historical branches
neonctl branches list --project-id <proj-id>

# Get timeline information for a branch
# This is done via the Neon Console UI
```

### Important Considerations
- **Retention Windows**: Know your plan's retention windows
- **Cost Implications**: Understand storage costs for multiple branches
- **Access Patterns**: Historical branches may have different performance characteristics
- **Security**: Apply same security practices to historical branches
- **Compliance**: Ensure backup strategies meet compliance requirements

### Recovery Procedures
1. Identify the point in time to restore to
2. Create a new branch from that point in time
3. Verify the data in the new branch
4. If satisfied, use the branch directly or copy data back
5. Clean up temporary branches when no longer needed