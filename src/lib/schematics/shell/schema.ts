export interface Schema {
  /** Whether to skip package.json install. */
  skipPackageJson: boolean;

  /** Name of pre-built theme to install. */
  theme: 'indigo-pink' | 'deeppurple-amber' | 'pink-bluegrey' | 'purple-green' | 'custom';

  /** Name of the project to target. */
  project?: string;
}
