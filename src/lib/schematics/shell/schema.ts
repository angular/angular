export interface Schema {
  /**
   * Skip package.json install.
   */
  skipPackageJson: boolean;

  /**
   * Name of pre-built theme to install.
   */
  theme: 'indigo-pink' | 'deeppurple-amber' | 'pink-bluegrey' | 'purple-green' | 'custom';
}
