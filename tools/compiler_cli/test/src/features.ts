import {Component, Inject, OpaqueToken} from 'angular2/core';
import {NgIf} from 'angular2/common';

export const SOME_OPAQUE_TOKEN = new OpaqueToken('opaqueToken');

@Component({
  selector: 'comp-providers',
  template: '',
  providers: [
    {provide: 'strToken', useValue: 'strValue'},
    {provide: SOME_OPAQUE_TOKEN, useValue: 10},
    {provide: 'reference', useValue: NgIf},
    {provide: 'complexToken', useValue: {a: 1, b: ['test', SOME_OPAQUE_TOKEN]}},
  ]
})
export class CompWithProviders {
  constructor(@Inject('strToken') public ctxProp) {}
}

@Component({
  selector: 'cmp-reference',
  template: `
    <input #a>{{a.value}}
    <div *ngIf="true">{{a.value}}</div>
  `,
  directives: [NgIf]
})
export class CompWithReferences {
}
