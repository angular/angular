// #docregion
/** App specific SystemJS configuration */
System.config({
  packages: {
    // barrels
  },
  map: {
    'lodash':                     'npm:lodash@4.17.4',
    'jasmine-marbles':            'https://rawgit.com/brandonroberts/jasmine-marbles-builds/master/bundles/jasmine-marbles.umd.js'
  }
});
