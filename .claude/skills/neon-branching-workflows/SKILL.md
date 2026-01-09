---
name: Neon Branching - Development and Testing Workflows
description: Use Neon's powerful branching feature for development. Create database branches per feature, test safely, and merge with confidence. Use when implementing database branching workflows, creating feature branches, testing schema changes safely, using branching for CI/CD, creating development environments, implementing Git-like database workflows, managing branch lifecycles, and using branch-specific connection strings.
---

# Neon Branching - Development and Testing Workflows

## Understanding Database Branching

### What is Database Branching
Database branching in Neon creates fully-isolated copies of your database that share the same underlying storage through copy-on-write technology. Each branch is a complete, independent database that behaves like a traditional Git branch but for your data and schema.

### Key Benefits
- **Isolation**: Changes in one branch don't affect others
- **Speed**: Instant creation without copying entire datasets
- **Efficiency**: Shared storage through copy-on-write reduces costs
- **Safety**: Test schema changes and data modifications without risk to production
- **Collaboration**: Multiple developers can work independently on the same dataset

## Branching Concepts

### Parent and Child Branches
- **Parent Branch**: The source branch that a new branch is created from
- **Child Branch**: A branch created from a parent branch
- **Branch Hierarchy**: Branches can have multiple levels of parent-child relationships
- **Root Branch**: Usually the production branch at the top of the hierarchy

### Branch States
- **Ready**: Fully operational and accepting connections
- **Paused**: Compute is scaled to zero, storage remains intact
- **Initializing**: Creating the branch, may take a moment for complex schemas

## Creating Branches

### Creating from Production
1. Navigate to the Branches section in the Neon Console
2. Click "New Branch"
3. Select "production" (or main branch) as the parent
4. Give the branch a descriptive name (e.g., "feature-login-improvements")
5. Configure compute size if needed (typically smaller for development)

### Creating from Specific Points in Time
- Use the timeline slider to select a specific point in time
- Create a branch from that historical state
- Useful for testing against data from a specific moment

### Branch Naming Conventions
- Use descriptive names that reflect the purpose
- Include feature names: `feature-user-profile-update`
- Include developer names: `john/feature-payments`
- Include issue numbers: `issue-123-fix-authentication`

## Branching Workflows

### Feature Development Workflow
1. Create a branch from production for each feature
2. Apply schema changes and test data modifications
3. Test the application with the branch
4. Verify all functionality works correctly
5. Merge changes back to production through your application deployment process
6. Delete the feature branch after merging

### Team Development Workflow
- Each developer gets their own branch for development
- Periodically reset development branches to match production
- Coordinate schema changes across team members
- Use branch naming to identify ownership

### Testing Workflow
- Create test branches from production data
- Run integration tests against the isolated environment
- Perform load testing without affecting production
- Test migrations on copies of production data

### Staging Workflow
- Create a staging branch as an intermediate environment
- Apply changes to staging before promoting to production
- Use staging for final testing and validation

## Branch Management

### Branch Lifecycle
- **Creation**: Create branches as needed for development tasks
- **Development**: Use branches for coding and testing
- **Testing**: Validate changes on the branch
- **Merge**: Deploy changes to production through your CI/CD
- **Cleanup**: Delete branches after successful deployment

### Branch Cleanup and Archiving
- **Manual Deletion**: Delete branches that are no longer needed
- **Automatic Archiving**: Neon automatically archives inactive branches to cost-effective storage
- **Expiration Policies**: Set up automatic branch expiration for temporary branches

### Resetting Branches
- **Reset to Parent**: Reset a branch to match its parent branch completely
- **Use Case**: When you need to start fresh with the latest production data
- **Impact**: All changes made to the branch since the last sync will be lost

## Schema Changes with Branching

### Testing Schema Migrations
1. Create a branch from production
2. Apply the schema migration to the branch
3. Test the migration with your application
4. Verify data integrity and application functionality
5. If successful, apply to production using the same migration process

### Collaborative Schema Development
- Multiple developers can work on different schema changes in separate branches
- Test each change in isolation before integration
- Use schema diff tools to compare branches before merging

## Integration with Development Tools

### Neon CLI for Branching
```bash
# Install Neon CLI
npm install -g neonctl

# Authenticate
neonctl auth

# List projects
neonctl projects list

# List branches in a project
neonctl branches list --project-id your-project-id

# Create a new branch
neonctl branches create --project-id your-project-id --parent-branch production --name feature-new-ui

# Reset a branch to its parent
neonctl branches reset feature-branch --parent --project-id your-project-id

# Get connection string for a branch
neonctl connection-string feature-branch --project-id your-project-id
```

### GitHub Actions Integration
- Use Neon's GitHub Actions for automatic branch creation/deletion
- Create branches for each pull request
- Delete branches when pull requests are merged or closed
- Configure branch naming patterns

### CI/CD Pipeline Integration
- Create temporary branches for testing
- Run tests against isolated database copies
- Clean up branches after CI/CD runs complete
- Use branching to parallelize testing

## Schema Diff and Comparison

### Using Schema Diff
- Compare schema differences between branches
- Visual GitHub-style comparison of database schemas
- Identify what changes will be applied when merging
- Validate schema changes before applying to production

### Schema Validation
- Check for breaking changes
- Verify constraint additions/modifications
- Validate index changes
- Ensure referential integrity

## Connection Strings and Branching

### Branch-Specific Connection Strings
- Each branch has its own connection string
- Connection strings include the branch identifier
- Use different connection strings for different environments
- Store branch connection strings as environment variables

### Environment Configuration
```bash
# Development branch
DEV_DATABASE_URL="postgresql://user:pass@ep-dev-branch-id.region.neon.tech/dbname?sslmode=require"

# Feature branch
FEATURE_DATABASE_URL="postgresql://user:pass@ep-feature-branch-id.region.neon.tech/dbname?sslmode=require"

# Production branch
PROD_DATABASE_URL="postgresql://user:pass@ep-prod-branch-id.region.neon.tech/dbname?sslmode=require"
```

## Advanced Branching Techniques

### Schema-Only Branches
- Create branches with schema but no data
- Useful for sensitive data protection
- Test schema changes without copying sensitive data
- Ideal for development and testing environments

### Branching for Data Analysis
- Create analytical branches for reporting
- Run complex queries without affecting production
- Test analytical queries in isolated environments
- Generate reports from historical data points

### Branching for Performance Testing
- Create branches with production-like data for performance testing
- Test application performance under realistic conditions
- Analyze query performance without impacting users
- Validate scaling characteristics

## Best Practices

### When to Create Branches
- Before implementing new features
- When testing schema migrations
- For debugging production issues
- During performance testing
- For data analysis and reporting

### Branch Hygiene
- Delete branches after features are deployed
- Use descriptive names for easy identification
- Regularly audit and clean up unused branches
- Document branch purposes and ownership

### Collaboration Guidelines
- Communicate branch creation to team members
- Avoid making changes to shared branches simultaneously
- Coordinate schema changes across branches
- Use branch protection for critical branches

### Security Considerations
- Be mindful of sensitive data in branched databases
- Use schema-only branches when sensitive data isn't needed
- Implement proper access controls for different branches
- Monitor access to various branches

## Troubleshooting Common Issues

### Branch Creation Failures
- Check parent branch status (must be ready)
- Verify sufficient storage quota
- Ensure proper permissions

### Connection Issues
- Verify branch is in "ready" state
- Check connection string accuracy
- Confirm SSL settings are correct

### Schema Diff Problems
- Ensure both branches are accessible
- Check for schema corruption
- Verify branch integrity

## Quick Reference

### Common Branching Commands
- Create branch: `neonctl branches create --project-id <id> --name <name>`
- List branches: `neonctl branches list --project-id <id>`
- Reset branch: `neonctl branches reset <branch-name> --parent --project-id <id>`
- Delete branch: `neonctl branches delete <branch-name> --project-id <id>`

### Branching Workflow Summary
1. Create branch from production for feature development
2. Apply changes to the branch in isolation
3. Test thoroughly on the isolated branch
4. Use schema diff to validate changes
5. Deploy changes to production through normal process
6. Delete the branch after successful deployment