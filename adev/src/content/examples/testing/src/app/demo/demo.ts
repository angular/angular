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
  Input,
  OnChanges,
  OnDestroy,
  OnInit,
  Output,
  Pipe,
  PipeTransform,
  SimpleChanges,
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
  template: ` Bank Name: {{ bank }} Account Id: {{ id }} `,
})
export class BankAccountComponent {
  @Input() bank = '';
  @Input('account') id = '';
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
  template: '<span>Child-1({{text}})</span>',
})
export class Child1Component {
  @Input() text = 'Original';
}

@Component({
  selector: 'child-2',
  template: '<div>Child-2({{text}})</div>',
})
export class Child2Component {
  @Input() text = '';
}

@Component({
  selector: 'child-3',
  template: '<div>Child-3({{text}})</div>',
})
export class Child3Component {
  @Input() text = '';
}

@Component({
  selector: 'input-comp',
  template: '<input [(ngModel)]="name">',
  imports: [FormsModule],
})
export class InputComponent {
  name = 'John';
}

/* Prefer this metadata syntax */
// @Directive({
//   selector: 'input[value]',
//   host: {
//     '[value]': 'value',
//     '(input)': 'valueChange.emit($event.target.value)'
//   },
//   inputs:  ['value'],
//   outputs: ['valueChange']
// })
// export class InputValueBinderDirective {
//   value: any;
//   valueChange: EventEmitter<any> = new EventEmitter();
// }

// As the styleguide recommends
@Directive({selector: 'input[value]'})
export class InputValueBinderDirective {
  @HostBinding() @Input() value: any;

  @Output() valueChange: EventEmitter<any> = new EventEmitter();

  @HostListener('input', ['$event.target.value'])
  onInput(value: any) {
    this.valueChange.emit(value);
  }
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
  template: '<button type="button" class="hero" (click)="click()">Original {{hero.name}}</button>',
})
export class IoComponent {
  @Input() hero!: Hero;
  @Output() selected = new EventEmitter<Hero>();
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

///////// MyIfChildComp ////////
@Component({
  selector: 'my-if-child-1',
  template: ` <h4>MyIfChildComp</h4>
    <div>
      <label for="child-value"
        >Child value: <input id="child-value" [(ngModel)]="childValue" />
      </label>
    </div>
    <p><i>Change log:</i></p>
    @for (log of changeLog; track log; let i = $index) {
      <div>{{ i + 1 }} - {{ log }}</div>
    }`,
  imports: [FormsModule, sharedImports],
})
export class MyIfChildComponent implements OnInit, OnChanges, OnDestroy {
  @Input() value = '';
  @Output() valueChange = new EventEmitter<string>();

  get childValue() {
    return this.value;
  }
  set childValue(v: string) {
    if (this.value === v) {
      return;
    }
    this.value = v;
    this.valueChange.emit(v);
  }

  changeLog: string[] = [];

  ngOnInitCalled = false;
  ngOnChangesCounter = 0;
  ngOnDestroyCalled = false;

  ngOnInit() {
    this.ngOnInitCalled = true;
    this.changeLog.push('ngOnInit called');
  }

  ngOnDestroy() {
    this.ngOnDestroyCalled = true;
    this.changeLog.push('ngOnDestroy called');
  }

  ngOnChanges(changes: SimpleChanges) {
    for (const propName in changes) {
      this.ngOnChangesCounter += 1;
      const prop = changes[propName];
      const cur = JSON.stringify(prop.currentValue);
      const prev = JSON.stringify(prop.previousValue);
      this.changeLog.push(`${propName}: currentValue = ${cur}, previousValue = ${prev}`);
    }
  }
}

///////// MyIfParentComp ////////

@Component({
  selector: 'my-if-parent-comp',
  template: `
    <h3>MyIfParentComp</h3>
    <label for="parent"
      >Parent value:
      <input id="parent" [(ngModel)]="parentValue" />
    </label>
    <button type="button" (click)="clicked()">{{ toggleLabel }} Child</button><br />
    @if (showChild) {
      <div style="margin: 4px; padding: 4px; background-color: aliceblue;">
        <my-if-child-1 [(value)]="parentValue"></my-if-child-1>
      </div>
    }
  `,
  imports: [FormsModule, MyIfChildComponent, sharedImports],
})
export class MyIfParentComponent implements OnInit {
  ngOnInitCalled = false;
  parentValue = 'Hello, World';
  showChild = false;
  toggleLabel = 'Unknown';

  ngOnInit() {
    this.ngOnInitCalled = true;
    this.clicked();
  }

  clicked() {
    this.showChild = !this.showChild;
    this.toggleLabel = this.showChild ? 'Close' : 'Show';
  }
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
    MyIfParentComponent,
  ],
})
export class DemoComponent {}
//////// Aggregations ////////////

export const demoProviders = [MasterService, ValueService];
