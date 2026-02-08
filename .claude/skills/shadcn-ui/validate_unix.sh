#\!/bin/bash
# Validate shadcn-ui skill structure

echo "Validating shadcn-ui skill structure..."

# Check if main SKILL.md exists
if [ \! -f ".claude/skills/shadcn-ui/SKILL.md" ]; then
    echo "ERROR: SKILL.md not found"
    exit 1
else
    echo "SKILL.md exists"
fi

# Check if frontmatter is properly formatted
if head -n 10 .claude/skills/shadcn-ui/SKILL.md | grep -q "^---$" && \
   grep -q "^name: shadcn-ui$" .claude/skills/shadcn-ui/SKILL.md && \
   grep -q "^description:" .claude/skills/shadcn-ui/SKILL.md; then
    echo "Frontmatter is properly formatted"
else
    echo "ERROR: Frontmatter is not properly formatted"
    exit 1
fi

# Check if references directory exists and has content
if [ -d ".claude/skills/shadcn-ui/references" ] && [ -n "$(ls -A .claude/skills/shadcn-ui/references)" ]; then
    echo "References directory exists and has content"
else
    echo "ERROR: References directory is missing or empty"
    exit 1
fi

# Check if scripts directory exists (even if empty)
if [ -d ".claude/skills/shadcn-ui/scripts" ]; then
    echo "Scripts directory exists"
else
    echo "Scripts directory missing"
fi

# Check if assets directory exists (even if empty)
if [ -d ".claude/skills/shadcn-ui/assets" ]; then
    echo "Assets directory exists"
else
    echo "Assets directory missing"
fi

# Count reference files
ref_count=$(ls .claude/skills/shadcn-ui/references/*.md | wc -l)
if [ "$ref_count" -ge 3 ]; then
    echo "Found $ref_count reference files (adequate documentation)"
else
    echo "Found only $ref_count reference files (consider adding more)"
fi

echo ""
echo "shadcn-ui skill validation passed\!"
echo ""
echo "Skill location: .claude/skills/shadcn-ui/"
echo "Reference files: $(ls .claude/skills/shadcn-ui/references/ | wc -l)"
echo "Script files: $(ls .claude/skills/shadcn-ui/scripts/ | wc -l)"
echo ""
echo "The skill is ready to be used with Claude\!"
