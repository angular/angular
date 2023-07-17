import path from 'canonical-path';

export const RUNFILES_ROOT = path.resolve(process.env.RUNFILES, 'angular');

export function getExamplesBasePath(root) {
  return path.join(root, 'aio', 'content', 'examples');
}

export function getSharedPath(root) {
  return path.join(root, 'aio', 'tools', 'examples', 'shared');
}

export const EXAMPLE_CONFIG_FILENAME = 'example-config.json';
export const STACKBLITZ_CONFIG_FILENAME = 'stackblitz.json';
