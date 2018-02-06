/**
 * @license
 * Copyright Google Inc. All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */
import { SchematicsException, Tree } from '@angular-devkit/schematics';


// The interfaces below are generated from the Angular CLI configuration schema
// https://github.com/angular/angular-cli/blob/master/packages/@angular/cli/lib/config/schema.json
export interface AppConfig {
  /**
   * Name of the app.
   */
  name?: string;
  /**
   * Directory where app files are placed.
   */
  appRoot?: string;
  /**
   * The root directory of the app.
   */
  root?: string;
  /**
   * The output directory for build results.
   */
  outDir?: string;
  /**
   * List of application assets.
   */
  assets?: (string | {
      /**
       * The pattern to match.
       */
      glob?: string;
      /**
       * The dir to search within.
       */
      input?: string;
      /**
       * The output path (relative to the outDir).
       */
      output?: string;
  })[];
  /**
   * URL where files will be deployed.
   */
  deployUrl?: string;
  /**
   * Base url for the application being built.
   */
  baseHref?: string;
  /**
   * The runtime platform of the app.
   */
  platform?: ('browser' | 'server');
  /**
   * The name of the start HTML file.
   */
  index?: string;
  /**
   * The name of the main entry-point file.
   */
  main?: string;
  /**
   * The name of the polyfills file.
   */
  polyfills?: string;
  /**
   * The name of the test entry-point file.
   */
  test?: string;
  /**
   * The name of the TypeScript configuration file.
   */
  tsconfig?: string;
  /**
   * The name of the TypeScript configuration file for unit tests.
   */
  testTsconfig?: string;
  /**
   * The prefix to apply to generated selectors.
   */
  prefix?: string;
  /**
   * Experimental support for a service worker from @angular/service-worker.
   */
  serviceWorker?: boolean;
  /**
   * Global styles to be included in the build.
   */
  styles?: (string | {
      input?: string;
      [name: string]: any; // tslint:disable-line:no-any
  })[];
  /**
   * Options to pass to style preprocessors
   */
  stylePreprocessorOptions?: {
      /**
       * Paths to include. Paths will be resolved to project root.
       */
      includePaths?: string[];
  };
  /**
   * Global scripts to be included in the build.
   */
  scripts?: (string | {
      input: string;
      [name: string]: any; // tslint:disable-line:no-any
  })[];
  /**
   * Source file for environment config.
   */
  environmentSource?: string;
  /**
   * Name and corresponding file for environment config.
   */
  environments?: {
      [name: string]: any; // tslint:disable-line:no-any
  };
  appShell?: {
    app: string;
    route: string;
  };
}

export interface CliConfig {
  $schema?: string;
  /**
   * The global configuration of the project.
   */
  project?: {
      /**
       * The name of the project.
       */
      name?: string;
      /**
       * Whether or not this project was ejected.
       */
      ejected?: boolean;
  };
  /**
   * Properties of the different applications in this project.
   */
  apps?: AppConfig[];
  /**
   * Configuration for end-to-end tests.
   */
  e2e?: {
      protractor?: {
          /**
           * Path to the config file.
           */
          config?: string;
      };
  };
  /**
   * Properties to be passed to TSLint.
   */
  lint?: {
      /**
       * File glob(s) to lint.
       */
      files?: (string | string[]);
      /**
       * Location of the tsconfig.json project file.
       * Will also use as files to lint if 'files' property not present.
       */
      project: string;
      /**
       * Location of the tslint.json configuration.
       */
      tslintConfig?: string;
      /**
       * File glob(s) to ignore.
       */
      exclude?: (string | string[]);
  }[];
  /**
   * Configuration for unit tests.
   */
  test?: {
      karma?: {
          /**
           * Path to the karma config file.
           */
          config?: string;
      };
      codeCoverage?: {
          /**
           * Globs to exclude from code coverage.
           */
          exclude?: string[];
      };
  };
  /**
   * Specify the default values for generating.
   */
  defaults?: {
      /**
       * The file extension to be used for style files.
       */
      styleExt?: string;
      /**
       * How often to check for file updates.
       */
      poll?: number;
      /**
       * Use lint to fix files after generation
       */
      lintFix?: boolean;
      /**
       * Options for generating a class.
       */
      class?: {
          /**
           * Specifies if a spec file is generated.
           */
          spec?: boolean;
      };
      /**
       * Options for generating a component.
       */
      component?: {
          /**
           * Flag to indicate if a dir is created.
           */
          flat?: boolean;
          /**
           * Specifies if a spec file is generated.
           */
          spec?: boolean;
          /**
           * Specifies if the style will be in the ts file.
           */
          inlineStyle?: boolean;
          /**
           * Specifies if the template will be in the ts file.
           */
          inlineTemplate?: boolean;
          /**
           * Specifies the view encapsulation strategy.
           */
          viewEncapsulation?: ('Emulated' | 'Native' | 'None');
          /**
           * Specifies the change detection strategy.
           */
          changeDetection?: ('Default' | 'OnPush');
      };
      /**
       * Options for generating a directive.
       */
      directive?: {
          /**
           * Flag to indicate if a dir is created.
           */
          flat?: boolean;
          /**
           * Specifies if a spec file is generated.
           */
          spec?: boolean;
      };
      /**
       * Options for generating a guard.
       */
      guard?: {
          /**
           * Flag to indicate if a dir is created.
           */
          flat?: boolean;
          /**
           * Specifies if a spec file is generated.
           */
          spec?: boolean;
      };
      /**
       * Options for generating an interface.
       */
      interface?: {
          /**
           * Prefix to apply to interface names. (i.e. I)
           */
          prefix?: string;
      };
      /**
       * Options for generating a module.
       */
      module?: {
          /**
           * Flag to indicate if a dir is created.
           */
          flat?: boolean;
          /**
           * Specifies if a spec file is generated.
           */
          spec?: boolean;
      };
      /**
       * Options for generating a pipe.
       */
      pipe?: {
          /**
           * Flag to indicate if a dir is created.
           */
          flat?: boolean;
          /**
           * Specifies if a spec file is generated.
           */
          spec?: boolean;
      };
      /**
       * Options for generating a service.
       */
      service?: {
          /**
           * Flag to indicate if a dir is created.
           */
          flat?: boolean;
          /**
           * Specifies if a spec file is generated.
           */
          spec?: boolean;
      };
      /**
       * Properties to be passed to the build command.
       */
      build?: {
          /**
           * Output sourcemaps.
           */
          sourcemaps?: boolean;
          /**
           * Base url for the application being built.
           */
          baseHref?: string;
          /**
           * The ssl key used by the server.
           */
          progress?: boolean;
          /**
           * Enable and define the file watching poll time period (milliseconds).
           */
          poll?: number;
          /**
           * Delete output path before build.
           */
          deleteOutputPath?: boolean;
          /**
           * Do not use the real path when resolving modules.
           */
          preserveSymlinks?: boolean;
          /**
           * Show circular dependency warnings on builds.
           */
          showCircularDependencies?: boolean;
          /**
           * Use a separate bundle containing code used across multiple bundles.
           */
          commonChunk?: boolean;
          /**
           * Use file name for lazy loaded chunks.
           */
          namedChunks?: boolean;
      };
      /**
       * Properties to be passed to the serve command.
       */
      serve?: {
          /**
           * The port the application will be served on.
           */
          port?: number;
          /**
           * The host the application will be served on.
           */
          host?: string;
          /**
           * Enables ssl for the application.
           */
          ssl?: boolean;
          /**
           * The ssl key used by the server.
           */
          sslKey?: string;
          /**
           * The ssl certificate used by the server.
           */
          sslCert?: string;
          /**
           * Proxy configuration file.
           */
          proxyConfig?: string;
      };
      /**
       * Properties about schematics.
       */
      schematics?: {
          /**
           * The schematics collection to use.
           */
          collection?: string;
          /**
           * The new app schematic.
           */
          newApp?: string;
      };
  };
  /**
   * Specify which package manager tool to use.
   */
  packageManager?: ('npm' | 'cnpm' | 'yarn' | 'default');
  /**
   * Allow people to disable console warnings.
   */
  warnings?: {
      /**
       * Show a warning when the user enabled the --hmr option.
       */
      hmrWarning?: boolean;
      /**
       * Show a warning when the node version is incompatible.
       */
      nodeDeprecation?: boolean;
      /**
       * Show a warning when the user installed angular-cli.
       */
      packageDeprecation?: boolean;
      /**
       * Show a warning when the global version is newer than the local one.
       */
      versionMismatch?: boolean;
      /**
       * Show a warning when the TypeScript version is incompatible
       */
      typescriptMismatch?: boolean;
  };
}

export const configPath = '/.angular-cli.json';

export function getConfig(host: Tree): CliConfig {
  const configBuffer = host.read(configPath);
  if (configBuffer === null) {
    throw new SchematicsException('Could not find .angular-cli.json');
  }

  const config = JSON.parse(configBuffer.toString());

  return config;
}

export function getAppFromConfig(config: CliConfig, appIndexOrName: string): AppConfig | null {
  if (!config.apps) {
    return null;
  }

  if (parseInt(appIndexOrName) >= 0) {
    return config.apps[parseInt(appIndexOrName)];
  }

  return config.apps.filter((app) => app.name === appIndexOrName)[0];
}
