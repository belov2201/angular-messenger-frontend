import { definePreset } from '@primeuix/themes';
import { colorScheme } from './color-scheme';
import { card } from './components/card';
import { floatlabel } from './components/float-label';
import { inputtext } from './components/input-text';
import { progressspinner } from './components/progress-spinner';
import { toast } from './components/toast';
import Aura from '@primeuix/themes/aura';

export const Preset = definePreset(Aura, {
  semantic: {
    colorScheme,
  },
  components: {
    card,
    floatlabel,
    inputtext,
    progressspinner,
    toast,
  },
  css: `

  .subtitle {
    color: var(--p-text-muted-color);
    font-size: 0.75rem;
  }

  .title {
    font-weight: bold;
    font-size: 0.875rem;
  }

  .link {
    text-decoration: underline;
  }
    
  .error-field-message {
    font-size: 0.75rem;
    padding-left: 0.75rem;
    color: var(--p-surface-400);
  }
`,
});
