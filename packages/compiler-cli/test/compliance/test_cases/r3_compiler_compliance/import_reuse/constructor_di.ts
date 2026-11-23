import {Directive, ElementRef, Injectable, Pipe, PipeTransform, TemplateRef} from '@angular/core';

import DefaultDep from './default_dep';
import {Dep, OtherDep as AliasedDep} from './deps';
import * as deps from './deps';

@Injectable()
export class MyService {
  constructor(
    dep: Dep,
    aliased: AliasedDep,
    member: deps.Dep,
    nestedMember: deps.nested.DeepDep,
    defaultDep: DefaultDep,
  ) {}
}

@Directive({selector: '[myDir]'})
export class MyDir {
  constructor(el: ElementRef, template: TemplateRef<unknown>, dep: Dep) {}
}

@Pipe({name: 'myPipe'})
export class MyPipe implements PipeTransform {
  constructor(dep: Dep) {}

  transform(value: string) {
    return value;
  }
}
