import {Component, Directive, Input} from '@angular/core';

@Directive({selector: '[hostDir]'})
export class HostDir {
  @Input() label = '';
}

@Directive({selector: '[otherHostDir]'})
export class OtherHostDir {}

@Component({selector: 'badge', template: ''})
export class Badge {}

export function toNumber(value: string | number): number {
  return Number(value);
}
