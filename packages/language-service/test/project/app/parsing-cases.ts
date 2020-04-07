/**
 * @license
 * Copyright Google Inc. All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */

import {Component, Directive, EventEmitter, Input, OnChanges, Output, SimpleChanges, TemplateRef, ViewContainerRef} from '@angular/core';

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
  template: '<h1 h~{no-value-attribute}></h1>',
})
export class NoValueAttribute {
}

@Directive({
  selector: '[string-model]',
})
export class StringModel {
  @Input() model: string = 'model';
  @Output() modelChange: EventEmitter<string> = new EventEmitter();
}

@Directive({
  selector: '[number-model]',
})
export class NumberModel {
  @Input('inputAlias') model: number = 0;
  @Output('outputAlias') modelChange: EventEmitter<number> = new EventEmitter();
}

@Directive({
  selector: '[hint-model]',
  inputs: ['hint'],
  outputs: ['hintChange'],
})
export class HintModel {
  hint: string = 'hint';
  hintChange: EventEmitter<string> = new EventEmitter();
}

class CounterDirectiveContext<T> {
  constructor(public $implicit: T) {}
}

@Directive({selector: '[counterOf]'})
export class CounterDirective implements OnChanges {
  // Object does not have an "$implicit" property.
  constructor(private container: ViewContainerRef, private template: TemplateRef<Object>) {}

  @Input('counterOf') counter: number = 0;
  ngOnChanges(_changes: SimpleChanges) {
    this.container.clear();
    for (let i = 0; i < this.counter; ++i) {
      this.container.createEmbeddedView(this.template, new CounterDirectiveContext<number>(i + 1));
    }
  }
}

interface WithContextDirectiveContext {
  $implicit: {implicitPerson: Hero;};
  nonImplicitPerson: Hero;
}

@Directive({selector: '[withContext]'})
export class WithContextDirective {
  constructor(_template: TemplateRef<WithContextDirectiveContext>) {}

  static ngTemplateContextGuard(dir: WithContextDirective, ctx: unknown):
      ctx is WithContextDirectiveContext {
    return true;
  }
}

/**
 * This Component provides the `test-comp` selector.
 */
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
  /**
   * This is the title of the `TemplateReference` Component.
   */
  title = 'Some title';
  hero: Hero = {id: 1, name: 'Windstorm'};
  heroP = Promise.resolve(this.hero);
  heroes: Hero[] = [this.hero];
  heroesP = Promise.resolve(this.heroes);
  tupleArray: [string, Hero] = ['test', this.hero];
  league: Hero[][] = [this.heroes];
  heroesByName: {[name: string]: Hero} = {};
  primitiveIndexType: {[name: string]: string} = {};
  anyValue: any;
  optional?: string;
  // Use to test the `index` variable conflict between the `ngFor` and component context.
  index = null;
  myClick(event: any) {}
  birthday = new Date();
  readonlyHeroes: ReadonlyArray<Readonly<Hero>> = this.heroes;
  constNames = [{name: 'name'}] as const;
  private myField = 'My Field';
}
