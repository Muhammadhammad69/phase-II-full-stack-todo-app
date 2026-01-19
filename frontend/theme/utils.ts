import { theme } from '@/theme/config';

/**
 * Get a color value from the theme
 * @param path - Dot notation path to the color (e.g. 'primary', 'text.primary', 'status.success')
 * @returns The color value or undefined if not found
 */
export const getColor = (path: string): string | undefined => {
  const pathParts = path.split('.');
  let result: any = theme.colors;

  for (const part of pathParts) {
    result = result?.[part];
  }

  return result;
};

/**
 * Get a spacing value from the theme
 * @param size - Size key ('xs', 'sm', 'md', 'lg', 'xl', 'xxl')
 * @returns The spacing value
 */
export const getSpacing = (size: keyof typeof theme.spacing): string => {
  return theme.spacing[size];
};

/**
 * Get a typography value from the theme
 * @param property - Typography property ('fontSize', 'fontWeight')
 * @param size - Size key
 * @returns The typography value
 */
export const getTypography = <T extends keyof typeof theme.typography>(
  property: T,
  size: keyof typeof theme.typography[T]
): string => {
  return theme.typography[property][size] as string;
};

/**
 * Get priority color based on priority level
 * @param priority - Priority level ('low', 'medium', 'high')
 * @returns The corresponding color
 */
export const getPriorityColor = (priority: 'low' | 'medium' | 'high'): string => {
  return theme.colors.priority[priority];
};

/**
 * Get status color based on status
 * @param status - Status type ('success', 'warning', 'error', 'info')
 * @returns The corresponding color
 */
export const getStatusColor = (status: 'success' | 'warning' | 'error' | 'info'): string => {
  return theme.colors.status[status];
};

/**
 * Get border radius value from theme
 * @param size - Border radius size ('sm', 'md', 'lg', 'xl')
 * @returns The border radius value
 */
export const getBorderRadius = (size: keyof typeof theme.borderRadius): string => {
  return theme.borderRadius[size];
};

/**
 * Get shadow value from theme
 * @param size - Shadow size ('sm', 'md', 'lg', 'xl')
 * @returns The shadow value
 */
export const getShadow = (size: keyof typeof theme.shadows): string => {
  return theme.shadows[size];
};