// types/common/validation.ts

// Validation rules
export const VALIDATION_RULES = {
  TASK: {
    TITLE_MIN_LENGTH: 1,
    TITLE_MAX_LENGTH: 100,
    DESCRIPTION_MAX_LENGTH: 500,
    VALID_PRIORITIES: ['low', 'medium', 'high'] as const,
  },
  USER: {
    USERNAME_MIN_LENGTH: 1,
    USERNAME_MAX_LENGTH: 50,
  },
} as const;

// Priority colors mapping
export const PRIORITY_COLORS = {
  low: '#00ff00',     // Green for low priority
  medium: '#ffff00',  // Yellow for medium priority
  high: '#ff0000'     // Red for high priority
} as const;