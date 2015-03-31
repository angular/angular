// TODO(vicb): implement this class properly
// The current stub implementation is only here to please cjs tests
export class VmTurnZone {
  constructor({enableLongStackTrace}) {
  }

  initCallbacks({onTurnStart, onTurnDone, onScheduleMicrotask, onErrorHandler} = {}) {
  }

  run(fn) {
    return fn();
  }

  runOutsideAngular(fn) {
    return fn();
  }
}
