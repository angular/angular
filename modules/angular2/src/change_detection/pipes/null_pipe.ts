import {isBlank, CONST} from 'angular2/src/facade/lang';
import {Pipe, BasePipe, WrappedValue, PipeFactory} from './pipe';

/**
 * @exportedAs angular2/pipes
 */
@CONST()
export class NullPipeFactory implements PipeFactory {
  supports(obj): boolean { return NullPipe.supportsObj(obj); }

  create(cdRef): Pipe { return new NullPipe(); }
}

/**
 * @exportedAs angular2/pipes
 */
export class NullPipe extends BasePipe {
  called: boolean = false;

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
