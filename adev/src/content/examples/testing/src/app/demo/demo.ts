/* eslint-disable @angular-eslint/directive-selector, guard-for-in, @angular-eslint/no-input-rename
 */
import {
  Component,
  ContentChildren,
  Directive,
  EventEmitter,
  HostBinding,
  HostListener,
  inject,
  Injectable,
  input,
  output,
  OnChanges,
  OnDestroy,
  OnInit,
  Pipe,
  PipeTransform,
  SimpleChanges,
  signal,
} from '@angular/core';
import {FormsModule} from '@angular/forms';
import {of} from 'rxjs';
import {delay} from 'rxjs/operators';

import {sharedImports} from '../shared/shared';

////////// The App: Services and Components for the tests. //////////////

export interface Hero {
  name: string;
}

////////// Services ///////////////
@Injectable()
export class ValueService {
  value = 'real value';

  getValue() {
    return this.value;
  }
  setValue(value: string) {
    this.value = value;
  }

  getObservableValue() {
    return of('observable value');
  }

  getPromiseValue() {
    return Promise.resolve('promise value');
  }

  getObservableDelayValue() {
    return of('observable delay value').pipe(delay(10));
  }
}

// #docregion MasterService
@Injectable()
export class MasterService {
  public valueService = inject(ValueService);
  getValue() {
    return this.valueService.getValue();
  }
}
// #enddocregion MasterService

/////////// Pipe ////////////////
/*
 * Reverse the input string.
 */
@Pipe({name: 'reverse'})
export class ReversePipe implements PipeTransform {
  transform(s: string) {
    let r = '';
    for (let i = s.length; i; ) {
      r += s[--i];
    }
    return r;
  }
}

//////////// Components /////////////
@Component({
  selector: 'bank-account',
  template: ` Bank Name: {{ bank() }} Account Id: {{ id() }} `,
})
export class BankAccountComponent {
  bank = input('');
  id = input('', {alias: 'account'});
}

/** A component with attributes, styles, classes, and property setting */
@Component({
  selector: 'bank-account-parent',
  template: `
    <bank-account
      bank="RBC"
      account="4747"
      [style.width.px]="width"
      [style.color]="color"
      [class.closed]="isClosed"
      [class.open]="!isClosed"
    />
  `,
  imports: [BankAccountComponent],
})
export class BankAccountParentComponent {
  width = 200;
  color = 'red';
  isClosed = true;
}

// #docregion LightswitchComp
@Component({
  selector: 'lightswitch-comp',
  template: ` <button type="button" (click)="clicked()">Click me!</button>
    <span>{{ message }}</span>`,
})
export class LightswitchComponent {
  isOn = false;
  clicked() {
    this.isOn = !this.isOn;
  }
  get message() {
    return `The light is ${this.isOn ? 'On' : 'Off'}`;
  }
}
// #enddocregion LightswitchComp

@Component({
  selector: 'child-1',
  template: '<span>Child-1({{text()}})</span>',
})
export class Child1Component {
  text = input('Original');
}

@Component({
  selector: 'child-2',
  template: '<div>Child-2({{text()}})</div>',
})
export class Child2Component {
  text = input('');
}

@Component({
  selector: 'child-3',
  template: '<div>Child-3({{text}})</div>',
})
export class Child3Component {
  text = input('');
}

@Component({
  selector: 'input-comp',
  template: '<input [(ngModel)]="name">',
  imports: [FormsModule],
})
export class InputComponent {
  name = signal('John');
}

@Component({
  selector: 'input-value-comp',
  template: ` Name: <input [value]="name" /> {{ name }} `,
})
export class InputValueBinderComponent {
  name = 'Sally'; // initial value
}

@Component({
  selector: 'parent-comp',
  imports: [Child1Component],
  template: 'Parent(<child-1></child-1>)',
})
export class ParentComponent {}

@Component({
  selector: 'io-comp',
  template:
    '<button type="button" class="hero" (click)="click()">Original {{hero().name}}</button>',
})
export class IoComponent {
  readonly hero = input.required<Hero>();
  readonly selected = output<Hero>();

  click() {
    this.selected.emit(this.hero);
  }
}

@Component({
  selector: 'io-parent-comp',
  template: `
    @if (!selectedHero) {
      <p><i>Click to select a hero</i></p>
    }
    @if (selectedHero) {
      <p>The selected hero is {{ selectedHero.name }}</p>
    }
    @for (hero of heroes; track hero) {
      <io-comp [hero]="hero" (selected)="onSelect($event)"> </io-comp>
    }
  `,
  imports: [IoComponent, sharedImports],
})
export class IoParentComponent {
  heroes: Hero[] = [{name: 'Bob'}, {name: 'Carol'}, {name: 'Ted'}, {name: 'Alice'}];
  selectedHero!: Hero;
  onSelect(hero: Hero) {
    this.selectedHero = hero;
  }
}

@Component({
  selector: 'my-if-comp',
  template: 'MyIf(@if (showMore) {<span>More</span>})',
  imports: [sharedImports],
})
export class MyIfComponent {
  showMore = false;
}

@Component({
  selector: 'my-service-comp',
  template: 'injected value: {{valueService.value}}',
  providers: [ValueService],
})
export class TestProvidersComponent {
  public valueService = inject(ValueService);
}

@Component({
  selector: 'my-service-comp',
  template: 'injected value: {{valueService.value}}',
  viewProviders: [ValueService],
})
export class TestViewProvidersComponent {
  public valueService = inject(ValueService);
}

@Component({
  selector: 'external-template-comp',
  templateUrl: './demo-external-template.html',
})
export class ExternalTemplateComponent {
  private service = inject(ValueService, {optional: true});

  serviceValue = this.service?.getValue() ?? '';
}

@Component({
  selector: 'comp-w-ext-comp',
  imports: [ExternalTemplateComponent],
  template: `
    <h3>comp-w-ext-comp</h3>
    <external-template-comp></external-template-comp>
  `,
})
export class InnerCompWithExternalTemplateComponent {}

@Component({selector: 'needs-content', template: '<ng-content></ng-content>'})
export class NeedsContentComponent {
  // children with #content local variable
  @ContentChildren('content') children: any;
}

@Component({
  selector: 'reverse-pipe-comp',
  template: `
    <input [(ngModel)]="text" />
    <span>{{ text | reverse }}</span>
  `,
  imports: [ReversePipe, FormsModule],
})
export class ReversePipeComponent {
  text = 'my dog has fleas.';
}

@Component({
  imports: [NeedsContentComponent],
  template: '<div>Replace Me</div>',
})
export class ShellComponent {}

@Component({
  selector: 'demo-comp',
  template: `
    <h1>Specs Demo</h1>
    <my-if-parent-comp></my-if-parent-comp>
    <hr>
    <h3>Input/Output Component</h3>
    <io-parent-comp></io-parent-comp>
    <hr>
    <h3>External Template Component</h3>
    <external-template-comp></external-template-comp>
    <hr>
    <h3>Component With External Template Component</h3>
    <comp-w-ext-comp></comp-w-ext-comp>
    <hr>
    <h3>Reverse Pipe</h3>
    <reverse-pipe-comp></reverse-pipe-comp>
    <hr>
    <h3>InputValueBinder Directive</h3>
    <input-value-comp></input-value-comp>
    <hr>
    <h3>Button Component</h3>
    <lightswitch-comp></lightswitch-comp>
    <hr>
    <h3>Needs Content</h3>
    <needs-content #nc>
      <child-1 #content text="My"></child-1>
      <child-2 #content text="dog"></child-2>
      <child-2 text="has"></child-2>
      <child-3 #content text="fleas"></child-3>
      <div #content>!</div>
    </needs-content>
  `,
  imports: [
    Child1Component,
    Child2Component,
    Child3Component,
    ExternalTemplateComponent,
    InnerCompWithExternalTemplateComponent,
    InputValueBinderComponent,
    IoParentComponent,
    LightswitchComponent,
    NeedsContentComponent,
    ReversePipeComponent,
  ],
})
export class DemoComponent {}
//////// Aggregations ////////////

export const demoProviders = [MasterService, ValueService];
