// #docregion
// Class used as a "narrowing" interface that exposes a minimal logger
// Other members of the actual implementation are invisible
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

// See https://stackoverflow.com/questions/43154832/unexpected-token-export-in-angular-app-with-systemjs-and-typescript/
export const _ = 0;
