//jshint strict: false
module.exports = function(config) {
  config.set({

    // #docregion basepath
    basePath: './',
    // #enddocregion basepath

    files: [
      'https://code.angularjs.org/1.5.5/angular.js',
      'https://code.angularjs.org/1.5.5/angular-animate.js',
      'https://code.angularjs.org/1.5.5/angular-resource.js',
      'https://code.angularjs.org/1.5.5/angular-route.js',
      'https://code.angularjs.org/1.5.5/angular-mocks.js',

      // #docregion files
      // System.js는 모듈을 로딩할 때 사용합니다.
      'node_modules/systemjs/dist/system.src.js',

      // 폴리필 스크립트 파일
      'node_modules/core-js/client/shim.js',

      // zone.js
      'node_modules/zone.js/dist/zone.js',
      'node_modules/zone.js/dist/zone-testing.js',

      // RxJs.
      { pattern: 'node_modules/rxjs/**/*.js', included: false, watched: false },
      { pattern: 'node_modules/rxjs/**/*.js.map', included: false, watched: false },

      // Angular와 Angular 테스트 라이브러리를 로드합니다.
      {pattern: 'node_modules/@angular/**/*.js', included: false, watched: false},
      {pattern: 'node_modules/@angular/**/*.js.map', included: false, watched: false},

      {pattern: 'systemjs.config.js', included: false, watched: false},
      'karma-test-shim.js',

      {pattern: 'app/**/*.module.js', included: false, watched: true},
      {pattern: 'app/*!(.module|.spec).js', included: false, watched: true},
      {pattern: 'app/!(bower_components)/**/*!(.module|.spec).js', included: false, watched: true},
      {pattern: 'app/**/*.spec.js', included: false, watched: true},

      {pattern: '**/*.html', included: false, watched: true},
      // #enddocregion files
    ],

    // #docregion html
    // 애셋을 로드하기 위해 기본 경로를 변경합니다.
    proxies: {
      // Angular가 컴포넌트를 컴파일하려면 애셋 파일이 필요합니다.
      "/phone-detail": '/base/app/phone-detail',
      "/phone-list": '/base/app/phone-list'
    },
    // #enddocregion html

    autoWatch: true,

    frameworks: ['jasmine'],

    browsers: ['Chrome'],

    plugins: [
      'karma-chrome-launcher',
      'karma-jasmine'
    ]

  });
};
