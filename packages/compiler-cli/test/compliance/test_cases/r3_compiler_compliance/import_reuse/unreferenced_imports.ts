import {Component, ElementRef, Input, QueryList, ViewChild, ViewChildren} from '@angular/core';

import {Box, Custom, Dep, Fallback, Model, OtherDep, Registered} from './deps';

@Component({selector: 'my-cmp', template: '<div #el></div>'})
export class MyCmp {
  // The types below are only referenced by the metadata of decorators that are removed.
  @ViewChild('el') el!: ElementRef;
  @ViewChildren('el') els!: QueryList<ElementRef>;
  @Input() model!: Model;

  // The metadata of a decorator that is not removed still refers to the type.
  @Input() @Custom() dep!: Dep;

  // A type that is also used as a value is still referenced.
  @Input() box!: Box<number>;
  @Input() other!: OtherDep;
  @Input() registered!: Registered;
  @Input() fallback!: Fallback;
}

export const NumberBox = Box<number>;
export const registry = {Registered};
export function valueOf(options: {value?: unknown}) {
  let value;
  ({value = Fallback} = options);
  return value;
}
export {OtherDep};
