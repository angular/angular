// #docregion
/** App specific SystemJS configuration */
System.config({
  packages: {
    // barrels
    'app/model': {main:'index.js', defaultExtension:'js'},
    'app/model/testing': {main:'index.js', defaultExtension:'js'}
  }
});
