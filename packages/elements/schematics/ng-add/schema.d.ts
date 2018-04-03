export interface Schema {
  /**
   * Skip package.json install.
   */
  skipPackageJson: boolean;

  /**
   * The project that needs the polyfill scripts
   */
  project: name;
}
