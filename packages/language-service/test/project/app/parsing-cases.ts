/**
 * @license
 * Copyright Google Inc. All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */

import {Component, Directive, EventEmitter, Input, Output} from '@angular/core';

import {Hero} from './app.component';

@Component({
  template: `
    <h1>
      Some <~{incomplete-open-lt}a~{incomplete-open-a} ~{incomplete-open-attr} text
    </h1>`,
})
export class CaseIncompleteOpen {
}

@Component({
  template: '<h1>Some <a> ~{missing-closing} text</h1>',
})
export class CaseMissingClosing {
}

@Component({
  template: '<h1>Some <unknown ~{unknown-element}> text</h1>',
})
export class CaseUnknown {
}

@Component({
  template: '<h1>{{data | ~{before-pipe}lowe~{in-pipe}rcase~{after-pipe} }}',
})
export class Pipes {
  data = 'Some string';
}

@Component({
  template: '<h1 h~{no-value-attribute}></h1>',
})
export class NoValueAttribute {
}


@Component({
  template: '<h1 model="~{attribute-binding-model}test"></h1>',
})
export class AttributeBinding {
  test: string = 'test';
}

@Component({
  template: '<h1 [model]="~{property-binding-model}test"></h1>',
})
export class PropertyBinding {
  test: string = 'test';
}

@Component({
  template: '<h1 (model)="~{event-binding-model}modelChanged()"></h1>',
})
export class EventBinding {
  test: string = 'test';

  modelChanged() {}
}

@Component({
  template: '<h1 [(model)]="~{two-way-binding-model}test"></h1>',
})
export class TwoWayBinding {
  test: string = 'test';
}

@Directive({
  selector: '[string-model]',
})
export class StringModel {
  @Input() model: string = 'model';
  @Output() modelChanged: EventEmitter<string> = new EventEmitter();
}

@Directive({
  selector: '[number-model]',
})
export class NumberModel {
  @Input('inputAlias') model: number = 0;
  @Output('outputAlias') modelChanged: EventEmitter<number> = new EventEmitter();
}

interface Person {
  name: string;
  age: number;
}

@Component({
  template: '<div *ngFor="~{for-empty}"></div>',
})
export class ForOfEmpty {
}

@Component({
  template: '<div *ngFor="let ~{for-let-empty}"></div>',
})
export class ForOfLetEmpty {
}

@Component({
  template: '<div *ngFor="let i = ~{for-let-i-equal}"></div>',
})
export class ForLetIEqual {
}

@Component({
  template: `
    <div *ngFor="~{for-let}let ~{for-person}person ~{for-of}of ~{for-people}people">
      <span>Name: {{~{for-interp-person}person.~{for-interp-name}name}}</span>
      <span>Age: {{person.~{for-interp-age}age}}</span>
    </div>`,
})
export class ForUsingComponent {
  people: Person[] = [];
}

@Component({
  template: `
    <div #div>
      <test-comp #test1>
        {{~{test-comp-content}}}
        {{test1.~{test-comp-after-test}name}}
        {{div.~{test-comp-after-div}.innerText}}
      </test-comp>
    </div>
    <test-comp #test2></test-comp>`,
})
export class References {
}

/*BeginTestComponent*/ @Component({
  selector: 'test-comp',
  template: '<div>Testing: {{name}}</div>',
})
export class TestComponent {
  @Input('tcName') name = 'test';
  @Output('test') testEvent = new EventEmitter();
} /*EndTestComponent*/

@Component({
  templateUrl: 'test.ng',
})
export class TemplateReference {
  title = 'Some title';
  hero: Hero = {id: 1, name: 'Windstorm'};
  anyValue: any;
  myClick(event: any) {}
}

@Component({
  template: '{{~{empty-interpolation}}}',
})
export class EmptyInterpolation {
  title = 'Some title';
  subTitle = 'Some sub title';
}
