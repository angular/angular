// #docregion
// /*global jasmine, __karma__, window*/
Error.stackTraceLimit = 0; // 앱을 테스트할 때는 보통 콜스택을 표시하지 않습니다.

// 콜스택을 모두 표시하려면 주석을 제거합니다.
// Error.stackTraceLimit = Infinity; //

jasmine.DEFAULT_TIMEOUT_INTERVAL = 1000;

var builtPath = '/base/app/';

__karma__.loaded = function () { };

function isJsFile(path) {
  return path.slice(-3) == '.js';
}

function isSpecFile(path) {
  return /\.spec\.(.*\.)?js$/.test(path);
}

function isBuiltFile(path) {
  return isJsFile(path) && (path.substr(0, builtPath.length) == builtPath);
}

var allSpecFiles = Object.keys(window.__karma__.files)
  .filter(isSpecFile)
  .filter(isBuiltFile);

System.config({
  baseURL: '/base',
  // 테스트 폴더에 있는 파일을 불러오도록 설정합니다.
  packages: { 'testing': { main: 'index.js', defaultExtension: 'js' } },

  // npm:이 systemjs.config의 `paths`에 미리 정의되었다고 간주합니다.
  // Angular 테스트 프레임워크를 맵핑합니다.
  map: {
    '@angular/core/testing': 'npm:@angular/core/bundles/core-testing.umd.js',
    '@angular/common/testing': 'npm:@angular/common/bundles/common-testing.umd.js',
    '@angular/common/http/testing': 'npm:@angular/common/bundles/common-http-testing.umd.js',
    '@angular/compiler/testing': 'npm:@angular/compiler/bundles/compiler-testing.umd.js',
    '@angular/platform-browser/testing': 'npm:@angular/platform-browser/bundles/platform-browser-testing.umd.js',
    '@angular/platform-browser-dynamic/testing': 'npm:@angular/platform-browser-dynamic/bundles/platform-browser-dynamic-testing.umd.js',
    '@angular/router/testing': 'npm:@angular/router/bundles/router-testing.umd.js',
    '@angular/forms/testing': 'npm:@angular/forms/bundles/forms-testing.umd.js',
  },
});

System.import('systemjs.config.js')
  .then(importSystemJsExtras)
  .then(initTestBed)
  .then(initTesting);

/** SystemJS 추가 설정. 생략해도 됩니다. */
function importSystemJsExtras(){
  return System.import('systemjs.config.extras.js')
  .catch(function(reason) {
    console.log(
      'Warning: System.import could not load the optional "systemjs.config.extras.js". Did you omit it by accident? Continuing without it.'
    );
    console.log(reason);
  });
}

function initTestBed(){
  return Promise.all([
    System.import('@angular/core/testing'),
    System.import('@angular/platform-browser-dynamic/testing')
  ])

  .then(function (providers) {
    var coreTesting    = providers[0];
    var browserTesting = providers[1];

    coreTesting.TestBed.initTestEnvironment(
      browserTesting.BrowserDynamicTestingModule,
      browserTesting.platformBrowserDynamicTesting());
  })
}

// 스펙 파일을 모두 로드하고 Karma를 시작합니다.
function initTesting () {
  return Promise.all(
    allSpecFiles.map(function (moduleName) {
      return System.import(moduleName);
    })
  )
  .then(__karma__.start, __karma__.error);
}
