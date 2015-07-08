import {isBlank, CONST} from 'angular2/src/facade/lang';
import {Pipe, BasePipe, WrappedValue, PipeFactory} from './pipe';
import {ChangeDetectorRef} from '../change_detector_ref';

@CONST()
export class NullPipeFactory implements PipeFactory {
  supports(obj: any): boolean { return NullPipe.supportsObj(obj); }

  create(cdRef: ChangeDetectorRef): Pipe { return new NullPipe(); }
}

export class NullPipe extends BasePipe {
  called: boolean = false;

  static supportsObj(obj: any): boolean { return isBlank(obj); }

  supports(obj: any): boolean { return NullPipe.supportsObj(obj); }

  transform(value: any, args: List<any> = null): WrappedValue {
    if (!this.called) {
      this.called = true;
      return WrappedValue.wrap(null);
    } else {
      return null;
    }
  }
}
