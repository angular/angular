import {isBlank, CONST} from 'angular2/src/facade/lang';
import {Pipe, WrappedValue, PipeFactory} from './pipe';

// HACK: workaround for Traceur behavior.
// It expects all transpiled modules to contain this marker.
// TODO: remove this when we no longer use traceur
export var __esModule = true;

/**
 * @exportedAs angular2/pipes
 */
@CONST()
export class NullPipeFactory extends PipeFactory {
  constructor() { super(); }

  supports(obj): boolean { return NullPipe.supportsObj(obj); }

  create(cdRef): Pipe { return new NullPipe(); }
}

/**
 * @exportedAs angular2/pipes
 */
export class NullPipe extends Pipe {
  called: boolean;
  constructor() {
    super();
    this.called = false;
  }

  static supportsObj(obj): boolean { return isBlank(obj); }

  supports(obj) { return NullPipe.supportsObj(obj); }

  transform(value) {
    if (!this.called) {
      this.called = true;
      return WrappedValue.wrap(null);
    } else {
      return null;
    }
  }
}
