import { definePreset } from '@primeuix/themes';
import { colorScheme } from './color-scheme';
import { card } from './components/card';
import { floatlabel } from './components/float-label';
import { inputtext } from './components/input-text';
import Aura from '@primeuix/themes/aura';

export const Preset = definePreset(Aura, {
  semantic: {
    colorScheme,
  },
  components: {
    card,
    floatlabel,
    inputtext,
  },
  css: `

  .subtitle {
    color: var(--p-text-muted-color) !important;
    font-size: 0.75rem;
  }

  .title {
    font-weight: bold;
    font-size: 0.875rem;
  }

  .link {
    text-decoration: underline;
  }
    
`,
});
