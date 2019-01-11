// We need to configure AMD modules which are not named because otherwise "require.js" is not
// able to resolve AMD imports to such modules.
require.config({
  paths: {
    'moment': 'moment/min/moment.min'
  }
});

// Workaround until https://github.com/angular/material2/issues/13883 has been addressed.
var module = {id: ''};
