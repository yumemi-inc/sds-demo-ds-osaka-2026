import { beforeAll } from 'vitest';
import { setProjectAnnotations } from '@storybook/react-vite';
import * as rendererAnnotations from '@storybook/react/preview';
import * as a11yAddonAnnotations from '@storybook/addon-a11y/preview';
import * as previewAnnotations from './preview';

const annotations = setProjectAnnotations([
  rendererAnnotations,
  a11yAddonAnnotations,
  previewAnnotations,
]);

beforeAll(annotations.beforeAll);
