/**
 * @license
 * Copyright Google Inc. All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */

import {MockData} from './test_utils';

export const toh = {
  'foo.ts': `export * from './app/app.component.ts';`,
  app: {
    'app.component.ts': `import { Component } from '@angular/core';

export class Hero {
  id: number;
  name: string;
}

@Component({
  selector: 'my-app',
  template: \`~{empty}
    <~{start-tag}h~{start-tag-after-h}1~{start-tag-h1} ~{h1-after-space}>~{h1-content} {{~{sub-start}title~{sub-end}}}</h1>
    ~{after-h1}<h2>{{~{h2-hero}hero.~{h2-name}name}} details!</h2>
    <div><label>id: </label>{{~{label-hero}hero.~{label-id}id}}</div>
    <div ~{div-attributes}>
      <label>name: </label>
    </div>
    &~{entity-amp}amp;
    \`
})
export class AppComponent {
  title = 'Tour of Heroes';
  hero: Hero = {
    id: 1,
    name: 'Windstorm'
  };
  private internal: string;
}`,
    'main.ts': `
import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { AppComponent }   from './app.component';
import { CaseIncompleteOpen, CaseMissingClosing, CaseUnknown, Pipes, TemplateReference, NoValueAttribute,
         AttributeBinding, StringModel,PropertyBinding, EventBinding, TwoWayBinding, EmptyInterpolation,
         ForOfEmpty, ForLetIEqual, ForOfLetEmpty, ForUsingComponent, References, TestComponent} from './parsing-cases';
import { WrongFieldReference, WrongSubFieldReference, PrivateReference, ExpectNumericType, LowercasePipe } from './expression-cases';
import { UnknownPeople, UnknownEven, UnknownTrackBy } from './ng-for-cases';
import { ShowIf } from './ng-if-cases';

@NgModule({
  imports: [CommonModule, FormsModule],
  declarations: [AppComponent, CaseIncompleteOpen, CaseMissingClosing, CaseUnknown, Pipes, TemplateReference, NoValueAttribute,
    AttributeBinding, StringModel, PropertyBinding, EventBinding, TwoWayBinding, EmptyInterpolation, ForOfEmpty, ForOfLetEmpty,
    ForLetIEqual, ForUsingComponent, References, TestComponent, WrongFieldReference, WrongSubFieldReference, PrivateReference,
    ExpectNumericType, UnknownPeople, UnknownEven, UnknownTrackBy, ShowIf, LowercasePipe]
})
export class AppModule {}

declare function bootstrap(v: any): void;

bootstrap(AppComponent);
`,
    'parsing-cases.ts': `
import {Component, Directive, Input, Output, EventEmitter} from '@angular/core';
import {Hero} from './app.component';

@Component({template: '<h1>Some <~{incomplete-open-lt}a~{incomplete-open-a} ~{incomplete-open-attr} text</h1>'})
export class CaseIncompleteOpen {}

@Component({template: '<h1>Some <a> ~{missing-closing} text</h1>'})
export class CaseMissingClosing {}

@Component({template: '<h1>Some <unknown ~{unknown-element}> text</h1>'})
export class CaseUnknown {}

@Component({template: '<h1>{{data | ~{before-pipe}lowe~{in-pipe}rcase~{after-pipe} }}'})
export class Pipes {
  data = 'Some string';
}

@Component({template: '<h1 h~{no-value-attribute}></h1>'})
export class NoValueAttribute {}


@Component({template: '<h1 model="~{attribute-binding-model}test"></h1>'})
export class AttributeBinding {
  test: string;
}

@Component({template: '<h1 [model]="~{property-binding-model}test"></h1>'})
export class PropertyBinding {
  test: string;
}

@Component({template: '<h1 (model)="~{event-binding-model}modelChanged()"></h1>'})
export class EventBinding {
  test: string;

  modelChanged() {}
}

@Component({template: '<h1 [(model)]="~{two-way-binding-model}test"></h1>'})
export class TwoWayBinding {
  test: string;
}

@Directive({selector: '[string-model]'})
export class StringModel {
  @Input() model: string;
  @Output() modelChanged: EventEmitter<string>;
}

interface Person {
  name: string;
  age: number
}

@Component({template: '<div *ngFor="~{for-empty}"></div>'})
export class ForOfEmpty {}

@Component({template: '<div *ngFor="let ~{for-let-empty}"></div>'})
export class ForOfLetEmpty {}

@Component({template: '<div *ngFor="let i = ~{for-let-i-equal}"></div>'})
export class ForLetIEqual {}

@Component({template: '<div *ngFor="~{for-let}let ~{for-person}person ~{for-of}of ~{for-people}people"> <span>Name: {{~{for-interp-person}person.~{for-interp-name}name}}</span><span>Age: {{person.~{for-interp-age}age}}</span></div>'})
export class ForUsingComponent {
  people: Person[];
}

@Component({template: '<div #div> <test-comp #test1> {{~{test-comp-content}}} {{test1.~{test-comp-after-test}name}} {{div.~{test-comp-after-div}.innerText}} </test-comp> </div> <test-comp #test2></test-comp>'})
export class References {}

@Component({selector: 'test-comp', template: '<div>Testing: {{name}}</div>'})
export class TestComponent {
  «@Input('∆tcName∆') name = 'test';»
  «@Output('∆test∆') testEvent = new EventEmitter();»
}

@Component({templateUrl: 'test.ng'})
export class TemplateReference {
  title = 'Some title';
  hero: Hero = {
    id: 1,
    name: 'Windstorm'
  };
  myClick(event: any) {

  }
}

@Component({template: '{{~{empty-interpolation}}}'})
export class EmptyInterpolation {
  title = 'Some title';
  subTitle = 'Some sub title';
}
`,
    'expression-cases.ts': `
import {Component} from '@angular/core';

export interface Person {
  name: string;
  age: number;
}

@Component({template: '{{~{foo}foo~{foo-end}}}'})
export class WrongFieldReference {
  bar = 'bar';
}

@Component({template: '{{~{nam}person.nam~{nam-end}}}'})
export class WrongSubFieldReference {
  person: Person = { name: 'Bob', age: 23 };
}

@Component({template: '{{~{myField}myField~{myField-end}}}'})
export class PrivateReference {
  private myField = 'My Field';
}

@Component({template: '{{~{mod}"a" ~{mod-end}% 2}}'})
export class ExpectNumericType {}

@Component({template: '{{ (name | lowercase).~{string-pipe}substring }}'})
export class LowercasePipe {
  name: string;
}
`,
    'ng-for-cases.ts': `
import {Component} from '@angular/core';

export interface Person {
  name: string;
  age: number;
}

@Component({template: '<div *ngFor="let person of ~{people_1}people_1~{people_1-end}"> <span>{{person.name}}</span> </div>'})
export class UnknownPeople {}

@Component({template: '<div ~{even_1}*ngFor="let person of people; let e = even_1"~{even_1-end}><span>{{person.name}}</span> </div>'})
export class UnknownEven {
  people: Person[];
}

@Component({template: '<div *ngFor="let person of people; trackBy ~{trackBy_1}trackBy_1~{trackBy_1-end}"><span>{{person.name}}</span> </div>'})
export class UnknownTrackBy {
  people: Person[];
}
`,
    'ng-if-cases.ts': `
import {Component} from '@angular/core';

@Component({template: '<div ~{implicit}*ngIf="show; let l=unknown"~{implicit-end}>Showing now!</div>'})
export class ShowIf {
  show = false;
}
`,
    'test.ng': `~{empty}
    <~{start-tag}h~{start-tag-after-h}1~{start-tag-h1} ~{h1-after-space}>~{h1-content} {{~{sub-start}title~{sub-end}}}</h1>
    ~{after-h1}<h2>{{~{h2-hero}hero.~{h2-name}name}} details!</h2>
    <div><label>id: </label>{{~{label-hero}hero.~{label-id}id}}</div>
    <div ~{div-attributes}>
      <label>name: </label>
    </div>
    &~{entity-amp}amp;
    `
  }
};
