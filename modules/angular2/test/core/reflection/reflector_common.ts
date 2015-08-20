import {makeDecorator, makeParamDecorator} from 'angular2/src/util/decorators';

export class ClassDecoratorImpl {
  value;

  constructor(value) { this.value = value; }
}

export class ParamDecoratorImpl {
  value;

  constructor(value) { this.value = value; }
}

export function classDecorator(value) {
  return new ClassDecoratorImpl(value);
}

export function paramDecorator(value) {
  return new ParamDecoratorImpl(value);
}

export var ClassDecorator = makeDecorator(ClassDecoratorImpl);
export var ParamDecorator = makeParamDecorator(ParamDecoratorImpl);
