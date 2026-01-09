---
name: Neon Monitoring and Cost Optimization
description: Monitor Neon database performance and optimize costs. Learn to analyze usage metrics, set up alerts, optimize compute resources, scale effectively, and reduce database expenses. Use when monitoring database performance, analyzing cost metrics, optimizing compute usage, setting up alerts, forecasting costs, implementing cost reduction strategies, scaling resources appropriately, and managing resource limits.
---

# Neon Monitoring and Cost Optimization

## Understanding Neon Pricing Model

### Cost Components
- **Compute Units (CU)**: Hourly charge for active compute resources
- **Storage**: Monthly charge for persistent storage (GB/month)
- **Data Transfer**: Charges for data egress (varies by region)
- **Branches**: Additional cost multipliers for active branches
- **API Calls**: Charges for Neon API usage

### Compute Unit Costs
- **0.25 CU**: 1 GB RAM, ~104 max_connections
- **0.50 CU**: 2 GB RAM, ~209 max_connections
- **1.0 CU**: 4 GB RAM, ~419 max_connections
- **2.0 CU**: 8 GB RAM, ~839 max_connections
- Higher CUs: Proportionally more resources

### Free Tier Benefits
- 10 million rows read per month
- 1 GB of storage
- 5 active compute hours per month
- 10 million rows written per month

## Monitoring Dashboard and Metrics

### Accessing Monitoring
1. **Neon Console Dashboard**: Main metrics overview
2. **Branch Details**: Per-branch metrics
3. **Project Settings**: Overall project metrics
4. **Billing Page**: Cost breakdown and usage

### Key Metrics to Monitor

#### Compute Metrics
- **Compute Hours**: Total hours of active compute
- **Average Compute Units**: Average CU usage over time
- **Peak Compute Usage**: Highest CU usage in the period
- **Compute Utilization**: Percentage of time compute is active

#### Storage Metrics
- **Current Storage**: Real-time storage usage
- **Storage Growth Rate**: How quickly storage is increasing
- **Backup Storage**: Storage used by historical data
- **Branch Storage**: Storage consumed by individual branches

#### Connection Metrics
- **Active Connections**: Current number of active connections
- **Connection Attempts**: Total connection attempts over time
- **Failed Connections**: Count of failed connection attempts
- **Pooled vs Direct**: Distribution of connection types

#### Performance Metrics
- **Query Performance**: Average query execution times
- **Slow Queries**: Queries taking longer than thresholds
- **Error Rates**: Database error rates over time
- **Throughput**: Queries per second (QPS)

## Cost Optimization Strategies

### Compute Optimization

#### Auto-Suspend Configuration
```bash
# Configure auto-suspend in Neon Console or via API
# Options typically include:
# - Never suspend (for production)
# - 5 minutes (for development)
# - 1 hour (for staging)
# - 5 minutes (default for new projects)
```

#### Compute Sizing
- **Development**: 0.25-0.5 CU (smaller instances)
- **Staging**: 0.5-1 CU (medium instances)
- **Production**: 1-4 CU (larger instances based on traffic)
- **Analytics**: Scale up temporarily during analysis

#### Right-Sizing Compute
```python
# Example: Adjust compute size based on time of day (via API)
import requests
import os

def adjust_compute_size(project_id, branch_id, desired_cu, api_key):
    """
    Adjust compute size based on usage patterns
    """
    headers = {
        'Authorization': f'Bearer {api_key}',
        'Content-Type': 'application/json'
    }

    payload = {
        'branch': {
            'compute_unit': desired_cu
        }
    }

    response = requests.patch(
        f'https://console.neon.tech/api/v2/projects/{project_id}/branches/{branch_id}',
        headers=headers,
        json=payload
    )

    return response.json()
```

### Storage Optimization

#### Data Archiving
- Identify and archive old, infrequently accessed data
- Use partitioning for time-series data
- Implement data retention policies
- Regularly clean up temporary or redundant data

#### Branch Management
- Delete unused branches regularly
- Use branch expiration policies
- Archive branches instead of deleting when needed for compliance
- Use schema-only branches for sensitive data environments

### Connection Pooling Optimization

#### Connection Pool Sizing
```javascript
// Optimize connection pool for different environments
const poolConfigs = {
  development: {
    min: 1,
    max: 5,
    acquire: 30000,
    idle: 10000
  },
  staging: {
    min: 2,
    max: 10,
    acquire: 30000,
    idle: 30000
  },
  production: {
    min: 5,
    max: 20,  // Adjust based on traffic patterns
    acquire: 60000,
    idle: 60000
  }
};
```

#### Connection Lifecycle Management
```python
# Python example with SQLAlchemy
from sqlalchemy import create_engine
from sqlalchemy.pool import QueuePool

engine = create_engine(
    database_url,
    poolclass=QueuePool,
    pool_size=10,
    max_overflow=20,
    pool_pre_ping=True,  # Verify connections before use
    pool_recycle=3600,   # Recycle connections every hour to handle compute restarts
    pool_timeout=30      # Timeout after 30 seconds if no connection available
)
```

## Setting Up Alerts and Monitoring

### Cost Alerts
```python
# Example: Set up cost monitoring with Neon API
import requests
import smtplib
from email.mime.text import MIMEText

def check_monthly_costs(api_key, budget_threshold):
    """
    Check current month's costs against budget threshold
    """
    headers = {
        'Authorization': f'Bearer {api_key}'
    }

    response = requests.get(
        'https://console.neon.tech/api/v2/billing/usage',
        headers=headers
    )

    usage_data = response.json()
    current_cost = usage_data.get('total_charges', 0)

    if current_cost > budget_threshold:
        send_alert(f"Warning: Current month's cost (${current_cost}) exceeds budget (${budget_threshold})")

def send_alert(message):
    """
    Send cost alert via email
    """
    # Implementation for sending alerts
    pass
```

### Performance Alerts
```javascript
// Example: Monitor query performance
const { Pool } = require('pg');

async function monitorQueryPerformance() {
  const pool = new Pool({
    connectionString: process.env.DATABASE_URL,
    max: 10,
    idleTimeoutMillis: 30000,
    connectionTimeoutMillis: 2000,
  });

  // Track query execution times
  const queryTimes = [];

  setInterval(async () => {
    const startTime = Date.now();
    try {
      await pool.query('SELECT 1'); // Health check query
      const queryTime = Date.now() - startTime;

      queryTimes.push(queryTime);

      // Keep only last 100 measurements
      if (queryTimes.length > 100) {
        queryTimes.shift();
      }

      // Calculate average and check for performance degradation
      const avgTime = queryTimes.reduce((a, b) => a + b, 0) / queryTimes.length;

      if (avgTime > 1000) { // Alert if average query time exceeds 1 second
        console.warn(`Performance alert: Average query time is ${avgTime}ms`);
        // Send notification to monitoring system
      }
    } catch (err) {
      console.error('Query performance monitoring error:', err);
    }
  }, 60000); // Check every minute
}
```

## Resource Management and Scaling

### Scaling Strategies

#### Horizontal Scaling (Read Replicas)
```sql
-- Neon supports read replicas for scaling read operations
-- This is configured via the Neon Console or API
-- Example: Route read-heavy queries to replica endpoints
SELECT * FROM large_table WHERE condition = 'value'; -- Can be directed to read replica
```

#### Vertical Scaling (Compute Units)
```bash
# Example: Scale compute based on load (via Neon CLI)
neonctl branches update --project-id your-project-id --branch-id your-branch-id --compute-unit 2.0

# Or via API
curl -X PATCH \
  https://console.neon.tech/api/v2/projects/proj-123/branches/br-456 \
  -H "Authorization: Bearer $NEON_API_KEY" \
  -H "Content-Type: application/json" \
  -d '{"branch": {"compute_unit": 2.0}}'
```

### Traffic Pattern Analysis
```python
# Analyze traffic patterns to optimize scaling
import pandas as pd
import matplotlib.pyplot as plt
from datetime import datetime, timedelta

def analyze_traffic_patterns(log_data):
    """
    Analyze database connection logs to identify traffic patterns
    """
    df = pd.DataFrame(log_data)
    df['timestamp'] = pd.to_datetime(df['timestamp'])

    # Group by hour to identify peak hours
    hourly_stats = df.groupby(df['timestamp'].dt.hour).agg({
        'connection_count': ['mean', 'max', 'std']
    }).round(2)

    # Identify peak usage hours
    peak_hours = hourly_stats['connection_count']['max'].nlargest(3)

    print("Peak usage hours:")
    for hour, count in peak_hours.items():
        print(f"Hour {hour}:00 - {hour+1}:00, Peak connections: {count}")

    return peak_hours

# Example usage
# peak_hours = analyze_traffic_patterns(connection_logs)
```

## Cost Forecasting and Budgeting

### Usage Forecasting
```python
# Example: Forecast monthly costs based on current usage
def forecast_monthly_cost(current_daily_cost, days_remaining):
    """
    Forecast end-of-month cost based on current usage patterns
    """
    projected_cost = current_daily_cost * (30 - days_remaining)
    return projected_cost

def calculate_cost_breakdown(usage_data):
    """
    Calculate detailed cost breakdown
    """
    compute_cost = usage_data['compute_hours'] * usage_data['cu_rate_per_hour']
    storage_cost = usage_data['storage_gb'] * usage_data['storage_rate_per_gb_month']
    transfer_cost = usage_data['data_egress_gb'] * usage_data['transfer_rate_per_gb']

    total_cost = compute_cost + storage_cost + transfer_cost

    breakdown = {
        'compute': round(compute_cost, 2),
        'storage': round(storage_cost, 2),
        'transfer': round(transfer_cost, 2),
        'total': round(total_cost, 2)
    }

    return breakdown
```

### Budget Setting and Management
```bash
# Example: Set up budget tracking
# 1. Define monthly budget
MONTHLY_BUDGET=100.00

# 2. Track daily usage
DAILY_THRESHOLD=$(echo "$MONTHLY_BUDGET / 30" | bc -l)  # ~$3.33 per day

# 3. Alert when daily usage exceeds threshold
# This would be implemented in your monitoring system
```

## Optimization Best Practices

### Query Optimization
```sql
-- Optimize queries to reduce compute time
-- 1. Use proper indexing
CREATE INDEX CONCURRENTLY idx_users_email ON users(email);

-- 2. Limit result sets
SELECT id, name, email FROM users LIMIT 100;

-- 3. Use EXPLAIN to analyze query plans
EXPLAIN (ANALYZE, BUFFERS)
SELECT * FROM users u JOIN posts p ON u.id = p.user_id WHERE u.active = true;

-- 4. Avoid SELECT *
SELECT specific_columns FROM table WHERE condition = value;
```

### Data Lifecycle Management
```python
# Example: Implement data retention policies
from datetime import datetime, timedelta

def cleanup_old_data(table_name, days_to_keep=30):
    """
    Clean up old data to reduce storage costs
    """
    cutoff_date = datetime.now() - timedelta(days=days_to_keep)

    delete_query = f"""
    DELETE FROM {table_name}
    WHERE created_at < %s
    """

    # Execute delete query with cutoff_date
    # This should be done carefully and tested in development first
    pass

# Schedule cleanup jobs
import schedule
import time

schedule.every().day.at("02:00").do(lambda: cleanup_old_data('logs', 30))
schedule.every().week.do(lambda: cleanup_old_data('analytics_data', 90))

while True:
    schedule.run_pending()
    time.sleep(3600)  # Check every hour
```

## Branch-Specific Cost Optimization

### Branch Lifecycle Management
```bash
# Automate branch cleanup
# Example: Delete branches after pull requests are merged

# GitHub Action example
name: Cleanup Neon Branch
on:
  pull_request:
    types: [closed]

jobs:
  cleanup:
    runs-on: ubuntu-latest
    steps:
      - name: Delete Neon branch
        run: |
          # Install Neon CLI
          npm install -g neonctl

          # Authenticate
          neonctl auth --api-key ${{ secrets.NEON_API_KEY }}

          # Delete branch (named after PR)
          neonctl branches delete pr-${{ github.event.number }} --project-id ${{ secrets.NEON_PROJECT_ID }}
```

### Schema-Only Branches for Cost Savings
```bash
# Create schema-only branches to save on data storage costs
# This is particularly useful for sensitive data environments

# Via Neon Console or API
# Creates a branch with schema but no data
# Useful for:
# - Development without sensitive data
# - Schema testing
# - Migration testing
```

## Advanced Cost Optimization Techniques

### Compute Scheduling
```python
# Example: Schedule compute scaling based on known usage patterns
import asyncio
from datetime import datetime, time

async def scheduled_scaling():
    """
    Scale compute based on known usage patterns
    """
    while True:
        current_time = datetime.now().time()

        # Scale up during business hours
        if time(9, 0) <= current_time <= time(18, 0):  # 9 AM to 6 PM
            await scale_compute('production', 2.0)  # Higher CU during business hours
        else:
            await scale_compute('production', 0.5)   # Lower CU during off-hours

        await asyncio.sleep(3600)  # Check every hour

async def scale_compute(branch_name, cu_size):
    """
    Scale compute for a specific branch
    """
    # Implementation using Neon API
    pass
```

### Resource Quotas and Limits
```python
# Set up resource quotas to prevent runaway costs
# This can be done via Neon Console or API

# Example: Set connection limits
ALTER ROLE app_user CONNECTION LIMIT 100;

# Example: Set statement timeout
SET statement_timeout = 30000;  -- 30 seconds
```

## Monitoring Tools and Dashboards

### Custom Monitoring Dashboard
```python
# Example: Create a simple monitoring dashboard
import plotly.graph_objects as go
from plotly.subplots import make_subplots
import pandas as pd

def create_monitoring_dashboard(metrics_data):
    """
    Create a monitoring dashboard with key metrics
    """
    fig = make_subplots(
        rows=2, cols=2,
        subplot_titles=('Compute Usage', 'Storage Growth', 'Connections', 'Query Performance'),
        specs=[[{"secondary_y": True}, {"secondary_y": True}],
               [{"secondary_y": True}, {"secondary_y": True}]]
    )

    # Compute usage chart
    fig.add_trace(
        go.Scatter(x=metrics_data['time'], y=metrics_data['compute_cu'], name='Compute Units'),
        row=1, col=1
    )

    # Storage growth chart
    fig.add_trace(
        go.Scatter(x=metrics_data['time'], y=metrics_data['storage_gb'], name='Storage (GB)'),
        row=1, col=2
    )

    # Connections chart
    fig.add_trace(
        go.Scatter(x=metrics_data['time'], y=metrics_data['active_connections'], name='Active Connections'),
        row=2, col=1
    )

    # Query performance chart
    fig.add_trace(
        go.Scatter(x=metrics_data['time'], y=metrics_data['avg_query_time'], name='Avg Query Time (ms)'),
        row=2, col=2
    )

    fig.update_layout(height=600, showlegend=True, title_text="Neon Database Monitoring Dashboard")
    return fig
```

## Cost Optimization Checklist

### Daily Checks
- [ ] Monitor active compute hours
- [ ] Check for unusual connection patterns
- [ ] Review slow query logs
- [ ] Verify auto-suspend settings

### Weekly Reviews
- [ ] Analyze usage patterns
- [ ] Review branch usage and clean up unused branches
- [ ] Check storage growth trends
- [ ] Review cost forecasts

### Monthly Audits
- [ ] Compare actual vs. forecasted costs
- [ ] Review compute sizing appropriateness
- [ ] Audit user access and permissions
- [ ] Evaluate optimization strategies effectiveness

### Quarterly Planning
- [ ] Plan for expected traffic increases
- [ ] Review and adjust budget allocations
- [ ] Assess new features that could improve efficiency
- [ ] Update scaling policies based on usage patterns

## Troubleshooting Cost Issues

### High Compute Costs
- **Cause**: Compute not suspending properly
  - **Solution**: Verify auto-suspend settings, check for persistent connections
- **Cause**: Over-sized compute for workload
  - **Solution**: Right-size compute based on actual usage
- **Cause**: Unexpected traffic spikes
  - **Solution**: Implement monitoring and alerts

### High Storage Costs
- **Cause**: Uncontrolled data growth
  - **Solution**: Implement data retention policies
- **Cause**: Too many active branches
  - **Solution**: Clean up unused branches, use schema-only branches when appropriate
- **Cause**: Large binary objects (BLOBs) stored in database
  - **Solution**: Store large files externally, keep only references in database

### High Connection Costs
- **Cause**: Not using connection pooling effectively
  - **Solution**: Use pooled connections for web applications
- **Cause**: Connection leaks
  - **Solution**: Implement proper connection lifecycle management
- **Cause**: Too many short-lived connections
  - **Solution**: Optimize connection pool settings

## Quick Reference

### Cost Optimization Commands
```bash
# View current usage
neonctl projects usage --project-id your-project-id

# List branches and their resource usage
neonctl branches list --project-id your-project-id

# Scale compute size
neonctl branches update --project-id proj --branch-id br --compute-unit 1.0

# View billing information
curl -H "Authorization: Bearer $NEON_API_KEY" \
     https://console.neon.tech/api/v2/billing/usage
```

### Monitoring Quick Commands
```sql
-- Check active connections
SELECT count(*) as active_connections FROM pg_stat_activity;

-- Check longest running queries
SELECT pid, now() - pg_stat_activity.query_start AS duration, query
FROM pg_stat_activity
WHERE (now() - pg_stat_activity.query_start) > interval '5 minutes'
ORDER BY duration DESC;

-- Check connection limits
SHOW max_connections;
SELECT name, setting FROM pg_settings WHERE name = 'max_connections';
```

### Optimization Settings
- **Development**: Auto-suspend after 5 minutes, 0.25-0.5 CU
- **Staging**: Auto-suspend after 1 hour, 0.5-1 CU
- **Production**: No auto-suspend (or longer), appropriate CU size for traffic
- **Connection Pool**: Use pooled connections for web apps, direct for migrations
- **Query Timeout**: Implement reasonable timeouts to prevent runaway queries
- **Indexing**: Regularly review and optimize indexes
- **Archiving**: Implement data retention policies for old data