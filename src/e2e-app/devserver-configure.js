// We need to configure AMD modules which are not named because otherwise "require.js" is not
// able to resolve AMD imports to such modules.
require.config({
  paths: {
    'moment': 'moment/min/moment.min',

    // Support for lazy-loading of component examples.
    '@angular/components-examples': 'angular_material/src/components-examples',
  }
});
