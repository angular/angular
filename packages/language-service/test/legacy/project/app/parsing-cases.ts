/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.dev/license
 */

import {
  Component,
  Directive,
  EventEmitter,
  Input,
  OnChanges,
  Output,
  Pipe,
  PipeTransform,
  SimpleChanges,
  TemplateRef,
  ViewContainerRef,
} from '@angular/core';

import {Hero} from './app.component';

@Directive({
  selector: '[string-model]',
  exportAs: 'stringModel',
  standalone: false,
})
export class StringModel {
  @Input() model: string = 'model';
  @Output() modelChange: EventEmitter<string> = new EventEmitter();
}

@Directive({
  selector: '[number-model]',
  standalone: false,
})
export class NumberModel {
  @Input('inputAlias') model: number = 0;
  @Output('outputAlias') modelChange: EventEmitter<number> = new EventEmitter();
}

@Directive({
  selector: '[hint-model]',
  inputs: ['hint'],
  outputs: ['hintChange'],
  standalone: false,
})
export class HintModel {
  hint: string = 'hint';
  hintChange: EventEmitter<string> = new EventEmitter();
}

class CounterDirectiveContext<T> {
  constructor(public $implicit: T) {}
}

@Directive({
  selector: '[counterOf]',
  standalone: false,
})
export class CounterDirective implements OnChanges {
  // Object does not have an "$implicit" property.
  constructor(
    private container: ViewContainerRef,
    private template: TemplateRef<Object>,
  ) {}

  @Input('counterOf') counter: number = 0;
  ngOnChanges(_changes: SimpleChanges) {
    this.container.clear();
    for (let i = 0; i < this.counter; ++i) {
      this.container.createEmbeddedView(this.template, new CounterDirectiveContext(i + 1));
    }
  }
}

interface WithContextDirectiveContext {
  $implicit: {implicitPerson: Hero};
  nonImplicitPerson: Hero;
}

@Directive({
  selector: '[withContext]',
  standalone: false,
})
export class WithContextDirective {
  constructor(_template: TemplateRef<WithContextDirectiveContext>) {}

  static ngTemplateContextGuard(
    dir: WithContextDirective,
    ctx: unknown,
  ): ctx is WithContextDirectiveContext {
    return true;
  }
}

@Directive({
  selector: 'button[custom-button][compound]',
  standalone: false,
})
export class CompoundCustomButtonDirective {
  @Input() config?: {color?: string};
}

@Directive({
  selector: '[eventSelector]',
  standalone: false,
})
export class EventSelectorDirective {
  @Output() eventSelector = new EventEmitter<void>();
}

@Pipe({
  name: 'prefixPipe',
  standalone: false,
})
export class TestPipe implements PipeTransform {
  transform(value: string, prefix: string): string;
  transform(value: number, prefix: number): number;
  transform(value: string | number, prefix: string | number): string | number {
    if (typeof value === 'string') {
      return `${prefix} ${value}`;
    }
    return parseInt(`${prefix}${value}`, 10 /* radix */);
  }
}

/**
 * This Component provides the `test-comp` selector.
 */
/*BeginTestComponent*/ @Component({
  selector: 'test-comp',
  template: '<div>Testing: {{name}}</div>',
  standalone: false,
})
export class TestComponent {
  @Input('tcName') name = 'test';
  @Output('test') testEvent = new EventEmitter();
} /*EndTestComponent*/

@Component({
  templateUrl: 'test.ng',
  standalone: false,
})
export class TemplateReference {
  /**
   * This is the title of the `TemplateReference` Component.
   */
  title = 'Tour of Heroes';
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
  strOrNumber: string | number = '';
  setTitle(newTitle: string) {
    this.title = newTitle;
  }
}
