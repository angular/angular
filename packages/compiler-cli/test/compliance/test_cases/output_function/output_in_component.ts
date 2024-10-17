import {Component, EventEmitter, output} from '@angular/core';
import {outputFromObservable} from '@angular/core/rxjs-interop';

@Component({
  template: 'Works',
})
export class TestComp {
  a = output();
  b = output<string>({});
  c = output<void>({alias: 'cPublic'});
  d = outputFromObservable(new EventEmitter<string>());
  e = outputFromObservable(new EventEmitter<number>());
}
