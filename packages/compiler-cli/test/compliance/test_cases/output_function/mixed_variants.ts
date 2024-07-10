import {Directive, EventEmitter, Output, output} from '@angular/core';
import {outputFromObservable} from '@angular/core/rxjs-interop';

@Directive({
  standalone: true,
})
export class TestDir {
  click1 = output();
  click2 = output<boolean>();
  click3 = outputFromObservable(new EventEmitter<number>());
  _bla = output<void>({alias: 'decoratorPublicName'});
  _bla2 = outputFromObservable(new EventEmitter(), {alias: 'decoratorPublicName2'});

  @Output() clickDecorator1 = new EventEmitter();
  @Output() clickDecorator2 = new EventEmitter<boolean>();
  @Output('decoratorPublicName') _blaDecorator = new EventEmitter<void>();
}
