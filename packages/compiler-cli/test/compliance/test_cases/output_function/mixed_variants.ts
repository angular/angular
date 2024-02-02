import {Directive, EventEmitter, Output, output} from '@angular/core';

@Directive({
  standalone: true,
})
export class TestDir {
  click1 = output();
  click2 = output<boolean>();
  _bla = output<void>({alias: 'decoratorPublicName'});

  @Output() clickDecorator1 = new EventEmitter();
  @Output() clickDecorator2 = new EventEmitter<boolean>();
  @Output('decoratorPublicName') _blaDecorator = new EventEmitter<void>();
}
