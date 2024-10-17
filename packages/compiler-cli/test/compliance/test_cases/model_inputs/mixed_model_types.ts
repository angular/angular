import {Directive, EventEmitter, Input, model, Output} from '@angular/core';

@Directive({})
export class TestDir {
  counter = model(0);
  modelWithAlias = model(false, {alias: 'alias'});

  @Input() decoratorInput = true;
  @Input('publicNameDecorator') decoratorInputWithAlias = true;

  @Output() decoratorOutput = new EventEmitter<boolean>();
  @Output('aliasDecoratorOutputWithAlias') decoratorOutputWithAlias = new EventEmitter<boolean>();

  @Input() decoratorInputTwoWay = true;
  @Output() decoratorInputTwoWayChange = new EventEmitter<boolean>();
}
