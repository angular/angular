import {VmTurnZone} from 'angular2/src/core/zone/vm_turn_zone';

export class MockVmTurnZone extends VmTurnZone {
  constructor() {
    super({enableLongStackTrace: false});
  }

  run(fn) {
    fn();
  }

  runOutsideAngular(fn) {
    return fn();
  }
}
