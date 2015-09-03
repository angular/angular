import {
  makeDecorator,
  makeParamDecorator,
  makePropDecorator
} from 'angular2/src/core/util/decorators';

export class ClassDecoratorMeta {
  constructor(public value) {}
}

export class ParamDecoratorMeta {
  constructor(public value) {}
}

export class PropDecoratorMeta {
  constructor(public value) {}
}

export function classDecorator(value) {
  return new ClassDecoratorMeta(value);
}

export function paramDecorator(value) {
  return new ParamDecoratorMeta(value);
}

export function propDecorator(value) {
  return new PropDecoratorMeta(value);
}

export var ClassDecorator = makeDecorator(ClassDecoratorMeta);
export var ParamDecorator = makeParamDecorator(ParamDecoratorMeta);
export var PropDecorator = makePropDecorator(PropDecoratorMeta);
