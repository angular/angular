//jshint strict: false
module.exports = function(config) {
  config.set({

    basePath: './app',

    files: [
      'https://code.angularjs.org/1.5.5/angular.js',
      'https://code.angularjs.org/1.5.5/angular-animate.js',
      'https://code.angularjs.org/1.5.5/angular-resource.js',
      'https://code.angularjs.org/1.5.5/angular-route.js',
      'https://code.angularjs.org/1.5.5/angular-mocks.js',
      '**/*.module.js',
      '*!(.module|.spec).js',
      '!(bower_components)/**/*!(.module|.spec).js',
      '**/*.spec.js'
    ],

    // This is needed, because the AngularJS files are loaded from `https://code.angularjs.org/`.
    // Without this, latest browsers prevent loading the scripts from localhost with:
    // ```
    // Access to script at 'https://code.angularjs.org/1.5.5/angular.js' from origin
    // 'http://localhost:9876' has been blocked by CORS policy: No 'Access-Control-Allow-Origin'
    // header is present on the requested resource.
    // ```
    crossOriginAttribute: false,

    autoWatch: true,

    frameworks: ['jasmine'],

    browsers: ['Chrome', 'Firefox'],

    plugins: [
      'karma-chrome-launcher',
      'karma-firefox-launcher',
      'karma-jasmine'
    ]

  });
};
