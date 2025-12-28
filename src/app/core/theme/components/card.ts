import { CardDesignTokens } from '@primeuix/themes/types/card';

export const card: CardDesignTokens = {
  colorScheme: {
    light: {
      root: {
        background: '{surface.50}',
        shadow: 'none',
      },
    },
  },
  body: {
    padding: '1rem',
  },
  css: ({ dt }) => `
        .p-card {
            border: 1px solid ${dt('surface.200')};
        }
    `,
};
