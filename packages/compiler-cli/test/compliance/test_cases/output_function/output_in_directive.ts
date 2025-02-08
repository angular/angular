import {Directive, EventEmitter, output} from '@angular/core';
import {outputFromObservable} from '@angular/core/rxjs-interop';

@Directive({
})
export class TestDir {
  a = output();
  b = output<string>({});
  c = output<void>({alias: 'cPublic'});
  d = outputFromObservable(new EventEmitter<string>());
  e = outputFromObservable(new EventEmitter<number>());
}
