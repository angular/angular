/**
 * @license
 * Copyright Google Inc. All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */

import {makeDecorator, makeParamDecorator, makePropDecorator} from '@angular/core/src/util/decorators';

export interface ClassDecoratorFactory {
  (data: ClassDecorator): any;
  new (data: ClassDecorator): ClassDecorator;
}

export interface ClassDecorator { value: any; }

export interface ParamDecorator { value: any; }

export interface PropDecorator { value: any; }

export function classDecorator(value: any /** TODO #9100 */) {
  return new ClassDecorator({value: value});
}

export function paramDecorator(value: any /** TODO #9100 */) {
  return new ParamDecorator(value);
}

export function propDecorator(value: any /** TODO #9100 */) {
  return new PropDecorator(value);
}

/** @Annotation */ export const ClassDecorator =
    <ClassDecoratorFactory>makeDecorator('ClassDecorator', {value: undefined});
/** @Annotation */ export const ParamDecorator =
    makeParamDecorator('ParamDecorator', [['value', undefined]]);
/** @Annotation */ export const PropDecorator =
    makePropDecorator('PropDecorator', [['value', undefined]]);

// used only in Dart
export class HasGetterAndSetterDecorators {}
