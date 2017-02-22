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
