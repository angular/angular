// #docregion
// 이 클래스는 원래 있는 클래스의 API를 제한하기 위해 사용합니다.
// 이 클래스에 정의되지 않은 부모 클래스의 멤버는 보이지 않게 됩니다.
export abstract class MinimalLogger {
  logs: string[];
  logInfo: (msg: string) => void;
}
// #enddocregion

/*
// Transpiles to:
// #docregion minimal-logger-transpiled
  var MinimalLogger = (function () {
    function MinimalLogger() {}
    return MinimalLogger;
  }());
  exports("MinimalLogger", MinimalLogger);
// #enddocregion minimal-logger-transpiled
*/

// See http://stackoverflow.com/questions/43154832/unexpected-token-export-in-angular-app-with-systemjs-and-typescript/
export const _ = 0;
