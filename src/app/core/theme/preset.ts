import { definePreset } from '@primeuix/themes';
import { colorScheme } from './color-scheme';
import { card } from './components/card';
import { floatlabel } from './components/float-label';
import { inputtext } from './components/input-text';
import { progressspinner } from './components/progress-spinner';
import { toast } from './components/toast';
import { avatar } from './components/avatar';
import { button } from './components/button';
import { dialog } from './components/dialog';
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
    avatar,
    button,
    dialog,
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

  .no-read-count {
    font-size: 0.625rem;
    padding: 0.2rem 0.6rem;
    border: 1px solid var(--color-green-900);
    color: var(--color-green-300);
    background-color: var(--color-green-950);
    font-weight: bold;
    border-radius: 1rem;
  }

  .base-p-card {
    min-width: 300px;
    max-width: 380px;
    width: 30vw;
    max-height: 70vh;
    overflow:auto;
  }
`,
});
