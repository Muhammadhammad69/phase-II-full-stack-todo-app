// theme/config.ts
export const techInnovationTheme = {
  colors: {
    primary: '#0ea5e9',           // Sky blue - represents innovation and technology
    secondary: '#8b5cf6',         // Violet - modern and sophisticated
    background: '#f8fafc',        // Light grayish blue background for light mode
    surface: '#ffffff',           // White surfaces
    text: {
      primary: '#1e293b',         // Dark slate for primary text
      secondary: '#64748b',       // Cool gray for secondary text
      disabled: '#cbd5e1',        // Light gray for disabled text
    },
    status: {
      success: '#10b981',         // Emerald green for success
      warning: '#f59e0b',         // Amber for warnings
      error: '#ef4444',           // Red for errors
      info: '#0ea5e9',            // Sky blue for info
    },
    priority: {
      high: '#dc2626',            // Red for high priority
      medium: '#d97706',          // Orange for medium priority
      low: '#16a34a',             // Green for low priority
    },
  },
  spacing: {
    xs: '0.25rem',               // 4px
    sm: '0.5rem',                // 8px
    md: '1rem',                  // 16px
    lg: '1.5rem',                // 24px
    xl: '2rem',                  // 32px
    xxl: '3rem',                 // 48px
  },
  typography: {
    fontFamily: "'Inter', 'SF Pro Display', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Oxygen, Ubuntu, Cantarell, sans-serif",
    fontSize: {
      xs: '0.75rem',             // 12px
      sm: '0.875rem',            // 14px
      md: '1rem',                // 16px
      lg: '1.125rem',            // 18px
      xl: '1.25rem',             // 20px
      '2xl': '1.5rem',           // 24px
      '3xl': '1.875rem',         // 30px
      '4xl': '2.25rem',          // 36px
    },
    fontWeight: {
      normal: 400,
      medium: 500,
      semibold: 600,
      bold: 700,
    },
  },
  borderRadius: {
    sm: '0.25rem',               // 4px
    md: '0.375rem',              // 6px
    lg: '0.5rem',                // 8px
    xl: '0.75rem',               // 12px
  },
  shadows: {
    sm: '0 1px 2px 0 rgba(0, 0, 0, 0.05)',
    md: '0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)',
    lg: '0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05)',
    xl: '0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04)',
  },
};

// Legacy theme for backward compatibility
export const legacyTheme = {
  colors: {
    primary: '#0066ff',           // Electric blue
    secondary: '#00ffff',         // Neon cyan
    background: '#1e1e1e',        // Dark gray
    surface: '#2d2d2d',           // Slightly lighter gray for surfaces
    text: {
      primary: '#ffffff',         // White text
      secondary: '#b3b3b3',       // Gray text
      disabled: '#666666',        // Disabled text
    },
    status: {
      success: '#00ff00',         // Green for success/completed
      warning: '#ffff00',         // Yellow for warnings
      error: '#ff0000',           // Red for errors
      info: '#0066ff',            // Blue for info
    },
    priority: {
      high: '#ff0000',            // Red for high priority
      medium: '#ffff00',          // Yellow for medium priority
      low: '#00ff00',             // Green for low priority
    },
  },
  spacing: {
    xs: '0.25rem',               // 4px
    sm: '0.5rem',                // 8px
    md: '1rem',                  // 16px
    lg: '1.5rem',                // 24px
    xl: '2rem',                  // 32px
    xxl: '3rem',                 // 48px
  },
  typography: {
    fontFamily: "'DejaVu Sans', Arial, sans-serif",
    fontSize: {
      xs: '0.75rem',             // 12px
      sm: '0.875rem',            // 14px
      md: '1rem',                // 16px
      lg: '1.125rem',            // 18px
      xl: '1.25rem',             // 20px
      '2xl': '1.5rem',           // 24px
      '3xl': '1.875rem',         // 30px
      '4xl': '2.25rem',          // 36px
    },
    fontWeight: {
      normal: 400,
      medium: 500,
      semibold: 600,
      bold: 700,
    },
  },
  borderRadius: {
    sm: '0.25rem',               // 4px
    md: '0.375rem',              // 6px
    lg: '0.5rem',                // 8px
    xl: '0.75rem',               // 12px
  },
  shadows: {
    sm: '0 1px 2px 0 rgba(0, 0, 0, 0.05)',
    md: '0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)',
    lg: '0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05)',
    xl: '0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04)',
  },
};

// Current active theme
export const theme = techInnovationTheme;

export type Theme = typeof theme;

// CSS Custom Properties for theme tokens
export const cssVariables = {
  '--color-primary': theme.colors.primary,
  '--color-secondary': theme.colors.secondary,
  '--color-background': theme.colors.background,
  '--color-surface': theme.colors.surface,
  '--color-text-primary': theme.colors.text.primary,
  '--color-text-secondary': theme.colors.text.secondary,
  '--color-text-disabled': theme.colors.text.disabled,
  '--color-status-success': theme.colors.status.success,
  '--color-status-warning': theme.colors.status.warning,
  '--color-status-error': theme.colors.status.error,
  '--color-status-info': theme.colors.status.info,
  '--color-priority-high': theme.colors.priority.high,
  '--color-priority-medium': theme.colors.priority.medium,
  '--color-priority-low': theme.colors.priority.low,
  '--spacing-xs': theme.spacing.xs,
  '--spacing-sm': theme.spacing.sm,
  '--spacing-md': theme.spacing.md,
  '--spacing-lg': theme.spacing.lg,
  '--spacing-xl': theme.spacing.xl,
  '--spacing-xxl': theme.spacing.xxl,
  '--font-family': theme.typography.fontFamily,
  '--border-radius-sm': theme.borderRadius.sm,
  '--border-radius-md': theme.borderRadius.md,
  '--border-radius-lg': theme.borderRadius.lg,
  '--border-radius-xl': theme.borderRadius.xl,
  '--shadows-sm': theme.shadows.sm,
  '--shadows-md': theme.shadows.md,
  '--shadows-lg': theme.shadows.lg,
  '--shadows-xl': theme.shadows.xl,
};