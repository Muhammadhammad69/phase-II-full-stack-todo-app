---
name: Neon Console - Database Management and Monitoring
description: Master the Neon console for database management, monitoring, and configuration. Learn dashboard features, monitoring tools, database management, role management, SQL editor, logs, billing, and API integration. Use when navigating Neon console, monitoring database usage, managing roles and databases, viewing logs, configuring settings, managing billing, using SQL editor, exporting/importing data, and integrating with Neon API.
---

# Neon Console - Database Management and Monitoring

## Console Navigation and Layout

### Dashboard Overview
- **Project Dashboard**: Central hub for project management
- **Branches**: View and manage all database branches
- **Databases**: Manage database instances and schemas
- **Roles**: User and permission management
- **Settings**: Project configuration and billing
- **Logs**: Query logs and performance data
- **API**: API tokens and integration settings

### Main Navigation Areas
1. **Project Selector**: Switch between different projects
2. **Branch Selector**: Switch between different branches within a project
3. **Navigation Menu**: Access different console sections
4. **Status Bar**: Connection status, current branch, and user info

## Project Dashboard

### Overview Section
- **Project Status**: Shows overall project health and status
- **Metrics Display**: Compute usage, storage usage, connection counts
- **Quick Actions**: Connect, create branch, view settings

### Project Configuration
- **Region Selection**: Choose where your compute and storage are located
- **Auto-suspend Settings**: Configure when compute should scale to zero
- **Compute Size**: Adjust the maximum compute capacity for your project
- **Connection Limits**: Manage concurrent connection limits

## Branch Management

### Branch Overview
- **Branch List**: Displays all branches with status indicators
- **Parent/Child Relationships**: Visual representation of branch hierarchies
- **Branch Status**: Ready, paused, or initializing states
- **Created Date**: Timestamp for branch creation

### Branch Operations
- **Create Branch**: Create new branches from existing ones
- **Reset Branch**: Reset a branch to match its parent
- **Delete Branch**: Remove unwanted branches
- **Rename Branch**: Update branch names
- **Compare Branches**: Use schema diff to compare database schemas

### Branch Settings
- **Compute Configuration**: Adjust compute size for specific branches
- **Auto-suspend Settings**: Configure scaling behavior per branch
- **Connection Pooling**: Enable/disable connection pooling for branches

## Database Management

### Database List
- **Database Names**: View all databases in the current branch
- **Table Counts**: Number of tables in each database
- **Size Information**: Storage usage per database

### Schema Browser
- **Tables View**: List all tables with column information
- **Indexes**: View and manage database indexes
- **Constraints**: View foreign keys, primary keys, and other constraints
- **Views**: List and manage database views
- **Functions**: View custom database functions

### Interactive Tables (Drizzle Studio)
- **Data Grid**: Browse and edit table data visually
- **Filtering**: Filter data with custom criteria
- **Sorting**: Sort columns in ascending/descending order
- **Editing**: Add, update, and delete records
- **Export**: Export data in JSON/CSV formats

## Role Management

### Role List
- **Role Names**: List of all database roles/users
- **Permissions**: View role permissions and privileges
- **Connection Limits**: Per-role connection limits

### Role Creation and Modification
- **Create Role**: Add new database users/roles
- **Modify Permissions**: Grant/revoke database privileges
- **Change Password**: Update role passwords
- **Delete Role**: Remove unused roles

## Monitoring and Metrics

### Compute Usage
- **Current Compute**: Real-time compute unit (CU) usage
- **Historical Trends**: Compute usage over time
- **Peak Usage**: Track maximum compute consumption
- **Cost Tracking**: Monitor compute costs

### Storage Metrics
- **Current Storage**: Real-time storage usage
- **Storage Growth**: Historical storage growth trends
- **Backup Storage**: Storage used by backups and branches
- **Cost Tracking**: Monitor storage costs

### Connection Statistics
- **Active Connections**: Currently active database connections
- **Connection Attempts**: Total connection attempts over time
- **Failed Connections**: Track failed connection attempts
- **Connection Pooling**: Monitor pooled connection usage

### Query Performance
- **Slow Queries**: Identify queries with poor performance
- **Query Volume**: Track number of queries over time
- **Query Duration**: Monitor average query execution times
- **Error Rates**: Track query error rates

## SQL Editor

### Editor Features
- **Syntax Highlighting**: PostgreSQL syntax highlighting
- **Auto-completion**: Table and column name suggestions
- **History**: Saved query history with AI-generated descriptions
- **Shortcuts**: Keyboard shortcuts for common operations

### Query Execution
- **Run Queries**: Execute single or multiple queries
- **Results Display**: Tabular results with pagination
- **Query Timing**: Execution time information
- **Affected Rows**: Count of affected rows for DML operations

### AI Assistant
- **Natural Language Queries**: Convert English to SQL
- **Query Suggestions**: AI-powered query recommendations
- **Explain Plans**: AI-generated explanations of query performance

### Explain and Analyze
- **Query Plans**: Visual query execution plans
- **Performance Insights**: Recommendations for query optimization
- **Index Suggestions**: AI-powered indexing recommendations

## Logs and Analytics

### Query Logs
- **Execution History**: All executed queries with timestamps
- **Performance Data**: Execution time and resource usage
- **Error Logs**: Failed queries with error details
- **Access Logs**: Who accessed what data and when

### Performance Monitoring
- **Real-time Metrics**: Live performance monitoring
- **Historical Data**: Performance trends over time
- **Alert Thresholds**: Configurable alert thresholds
- **Export Capabilities**: Export logs for external analysis

## Billing and Resource Management

### Cost Tracking
- **Current Usage**: Real-time resource consumption
- **Cost Breakdown**: Detailed cost breakdown by resource
- **Usage Trends**: Historical usage patterns
- **Budget Alerts**: Configure spending limits

### Resource Limits
- **Compute Limits**: Maximum compute units allowed
- **Storage Limits**: Maximum storage capacity
- **Connection Limits**: Maximum concurrent connections
- **Rate Limits**: Query rate limitations

## API Integration

### API Tokens
- **Token Generation**: Create new API tokens
- **Token Permissions**: Define token scopes and permissions
- **Token Management**: Revoke or regenerate tokens

### API Usage
- **Project Management**: Create, update, delete projects via API
- **Branch Operations**: Manage branches programmatically
- **Monitoring**: Retrieve metrics and usage data via API
- **Automation**: Integrate with CI/CD and development workflows

## Security and Access Controls

### IP Allow Lists
- **Whitelist Configuration**: Restrict database access by IP
- **Rule Management**: Add, update, or remove IP rules
- **Validation**: Test IP rule effectiveness

### Audit Trail
- **Access Logs**: Track who accessed what and when
- **Configuration Changes**: Log all configuration changes
- **Security Events**: Monitor for suspicious activities

## Settings and Configuration

### Project Settings
- **General Configuration**: Basic project settings
- **Connection Settings**: Configure connection behaviors
- **Backup Settings**: Configure backup and retention policies
- **Integration Settings**: Configure third-party integrations

### Branch Settings
- **Compute Configuration**: Adjust compute resources per branch
- **Scaling Settings**: Configure auto-scaling behavior
- **Retention Settings**: Configure backup retention for branches

## Troubleshooting Tools

### Connection Diagnostics
- **Connection Testing**: Test database connectivity
- **Network Diagnostics**: Identify network issues
- **SSL Verification**: Verify SSL/TLS configuration

### Performance Diagnostics
- **Query Analysis**: Analyze slow or problematic queries
- **Resource Utilization**: Monitor system resource usage
- **Lock Detection**: Identify and resolve locking issues

## Quick Reference

### Common Tasks
- **Create Branch**: Dashboard → Branches → New Branch
- **Run Query**: SQL Editor → Enter SQL → Run
- **View Data**: Tables → Select Table → Browse
- **Monitor Usage**: Dashboard → Metrics Tab
- **Manage Roles**: Settings → Roles
- **Check Logs**: Logs → Query Logs

### Keyboard Shortcuts
- `Ctrl/Cmd + Enter`: Execute query in SQL Editor
- `Ctrl/Cmd + Shift + H`: View query history
- `Ctrl/Cmd + Space`: Trigger auto-completion

### Performance Tips
- Use connection pooling for applications with many connections
- Monitor query execution times regularly
- Use indexes appropriately for frequently queried columns
- Consider branch-specific compute sizing for different workloads