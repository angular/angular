/***********************************************************************************************
 * User Configuration.
 **********************************************************************************************/

const components = [
  'all',
  'button',
  'card',
  'checkbox',
  'dialog',
  'grid-list',
  'icon',
  'input',
  'list',
  'menu',
  'progress-bar',
  'progress-circle',
  'radio',
  'sidenav',
  'slider',
  'slide-toggle',
  'button-toggle',
  'tabs',
  'toolbar',
  'tooltip',
];


/** User packages configuration. */
const packages: any = {
  '@angular2-material/core': {
    format: 'cjs',
    main: 'core.umd.js'
  },
  // Set the default extension for the root package, because otherwise the demo-app can't
  // be built within the production mode. Due to missing file extensions.
  '.': {
    defaultExtension: 'js'
  }
};
components.forEach(name => {
  packages[`@angular2-material/${name}`] = {
    format: 'cjs',
    main: `${name}.umd.js`
  };
});


////////////////////////////////////////////////////////////////////////////////////////////////
/***********************************************************************************************
 * Everything underneath this line is managed by the CLI.
 **********************************************************************************************/
const angularPackages = {
  // Angular specific barrels.
  '@angular/core': { main: 'bundles/core.umd.js'},
  '@angular/core/testing': { main: 'bundles/core-testing.umd.js'},
  '@angular/common': { main: 'bundles/common.umd.js'},
  '@angular/compiler': { main: 'bundles/compiler.umd.js'},
  '@angular/http': { main: 'bundles/http.umd.js'},
  '@angular/forms': { main: 'bundles/forms.umd.js'},
  '@angular/router': { main: 'bundles/router.umd.js'},
  '@angular/platform-browser': { main: 'bundles/platform-browser.umd.js'},
  '@angular/platform-browser-dynamic': { main: 'bundles/platform-browser-dynamic.umd.js'},
  '@angular/platform-browser-dynamic/testing': {
    main: 'bundles/platform-browser-dynamic-testing.umd.js'
  },
};

const barrels: string[] = [
  // Thirdparty barrels.
  'rxjs',

  // App specific barrels.
  'demo-app',
  'button-toggle',
  'gestures',
  'live-announcer',
  'portal',
  'overlay',
  ...components
  /** @cli-barrel */
];

const _cliSystemConfig = angularPackages;
barrels.forEach((barrelName: string) => {
  (<any> _cliSystemConfig)[barrelName] = { main: 'index' };
});

/** Type declaration for ambient System. */
declare var System: any;

// Apply the CLI SystemJS configuration.
System.config({
  map: {
    '@angular': 'vendor/@angular',
    'rxjs': 'vendor/rxjs',
    'main': 'main.js'
  },
  packages: _cliSystemConfig
});

// Apply the user's configuration.
System.config({ packages });
