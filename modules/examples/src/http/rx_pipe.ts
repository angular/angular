/// <reference path="../../../angular2/typings/rx/rx.all.d.ts" />

import {isBlank, isPresent, CONST} from 'angular2/src/facade/lang';
import {Observable, ObservableWrapper} from 'angular2/src/facade/async';
import {Pipe, WrappedValue, PipeFactory} from 'angular2/src/change_detection/pipes/pipe';
import {ObservablePipe} from 'angular2/src/change_detection/pipes/observable_pipe';
import {ChangeDetectorRef} from 'angular2/src/change_detection/change_detector_ref';
import * as Rx from 'rx';

export class RxPipe extends ObservablePipe {
  supports(obs): boolean {
    if (Rx.hasOwnProperty('default')) {
      return obs instanceof (<any>Rx).default.Rx.Observable;
    } else {
      return obs instanceof <any>Rx.Observable;
    }
  }

  _subscribe(obs): void {
    this._observable = obs;
    this._subscription =
        (<any>obs).subscribe(value => {this._updateLatestValue(value)}, e => { throw e; });
  }
}

/**
 * Provides a factory for [ObervablePipe].
 *
 * @exportedAs angular2/pipes
 */
@CONST()
export class RxPipeFactory extends PipeFactory {
  constructor() { super(); }

  supports(obs): boolean { return obs instanceof (<any>Rx).default.Rx.Observable }

  create(cdRef): Pipe { return new RxPipe(cdRef); }
}
