import {__esDecorate, __runInitializers} from 'tslib';
/* eslint-disable @angular-eslint/directive-selector, guard-for-in, @angular-eslint/no-input-rename
 */
import {
  Component,
  ContentChildren,
  inject,
  Injectable,
  input,
  output,
  Pipe,
  signal,
} from '@angular/core';
import {FormsModule} from '@angular/forms';
import {of} from 'rxjs';
import {delay} from 'rxjs/operators';
import {sharedImports} from '../shared/shared';
////////// Services ///////////////
let ValueService = (() => {
  let _classDecorators = [Injectable()];
  let _classDescriptor;
  let _classExtraInitializers = [];
  let _classThis;
  var ValueService = class {
    static {
      _classThis = this;
    }
    static {
      const _metadata =
        typeof Symbol === 'function' && Symbol.metadata ? Object.create(null) : void 0;
      __esDecorate(
        null,
        (_classDescriptor = {value: _classThis}),
        _classDecorators,
        {kind: 'class', name: _classThis.name, metadata: _metadata},
        null,
        _classExtraInitializers,
      );
      ValueService = _classThis = _classDescriptor.value;
      if (_metadata)
        Object.defineProperty(_classThis, Symbol.metadata, {
          enumerable: true,
          configurable: true,
          writable: true,
          value: _metadata,
        });
      __runInitializers(_classThis, _classExtraInitializers);
    }
    value = 'real value';
    getValue() {
      return this.value;
    }
    setValue(value) {
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
  };
  return (ValueService = _classThis);
})();
export {ValueService};
// #docregion MasterService
let MasterService = (() => {
  let _classDecorators = [Injectable()];
  let _classDescriptor;
  let _classExtraInitializers = [];
  let _classThis;
  var MasterService = class {
    static {
      _classThis = this;
    }
    static {
      const _metadata =
        typeof Symbol === 'function' && Symbol.metadata ? Object.create(null) : void 0;
      __esDecorate(
        null,
        (_classDescriptor = {value: _classThis}),
        _classDecorators,
        {kind: 'class', name: _classThis.name, metadata: _metadata},
        null,
        _classExtraInitializers,
      );
      MasterService = _classThis = _classDescriptor.value;
      if (_metadata)
        Object.defineProperty(_classThis, Symbol.metadata, {
          enumerable: true,
          configurable: true,
          writable: true,
          value: _metadata,
        });
      __runInitializers(_classThis, _classExtraInitializers);
    }
    valueService = inject(ValueService);
    getValue() {
      return this.valueService.getValue();
    }
  };
  return (MasterService = _classThis);
})();
export {MasterService};
// #enddocregion MasterService
/////////// Pipe ////////////////
/*
 * Reverse the input string.
 */
let ReversePipe = (() => {
  let _classDecorators = [Pipe({name: 'reverse'})];
  let _classDescriptor;
  let _classExtraInitializers = [];
  let _classThis;
  var ReversePipe = class {
    static {
      _classThis = this;
    }
    static {
      const _metadata =
        typeof Symbol === 'function' && Symbol.metadata ? Object.create(null) : void 0;
      __esDecorate(
        null,
        (_classDescriptor = {value: _classThis}),
        _classDecorators,
        {kind: 'class', name: _classThis.name, metadata: _metadata},
        null,
        _classExtraInitializers,
      );
      ReversePipe = _classThis = _classDescriptor.value;
      if (_metadata)
        Object.defineProperty(_classThis, Symbol.metadata, {
          enumerable: true,
          configurable: true,
          writable: true,
          value: _metadata,
        });
      __runInitializers(_classThis, _classExtraInitializers);
    }
    transform(s) {
      let r = '';
      for (let i = s.length; i; ) {
        r += s[--i];
      }
      return r;
    }
  };
  return (ReversePipe = _classThis);
})();
export {ReversePipe};
//////////// Components /////////////
let BankAccountComponent = (() => {
  let _classDecorators = [
    Component({
      selector: 'bank-account',
      template: ` Bank Name: {{ bank() }} Account Id: {{ id() }} `,
    }),
  ];
  let _classDescriptor;
  let _classExtraInitializers = [];
  let _classThis;
  var BankAccountComponent = class {
    static {
      _classThis = this;
    }
    static {
      const _metadata =
        typeof Symbol === 'function' && Symbol.metadata ? Object.create(null) : void 0;
      __esDecorate(
        null,
        (_classDescriptor = {value: _classThis}),
        _classDecorators,
        {kind: 'class', name: _classThis.name, metadata: _metadata},
        null,
        _classExtraInitializers,
      );
      BankAccountComponent = _classThis = _classDescriptor.value;
      if (_metadata)
        Object.defineProperty(_classThis, Symbol.metadata, {
          enumerable: true,
          configurable: true,
          writable: true,
          value: _metadata,
        });
      __runInitializers(_classThis, _classExtraInitializers);
    }
    bank = input('');
    id = input('', {alias: 'account'});
  };
  return (BankAccountComponent = _classThis);
})();
export {BankAccountComponent};
/** A component with attributes, styles, classes, and property setting */
let BankAccountParentComponent = (() => {
  let _classDecorators = [
    Component({
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
    }),
  ];
  let _classDescriptor;
  let _classExtraInitializers = [];
  let _classThis;
  var BankAccountParentComponent = class {
    static {
      _classThis = this;
    }
    static {
      const _metadata =
        typeof Symbol === 'function' && Symbol.metadata ? Object.create(null) : void 0;
      __esDecorate(
        null,
        (_classDescriptor = {value: _classThis}),
        _classDecorators,
        {kind: 'class', name: _classThis.name, metadata: _metadata},
        null,
        _classExtraInitializers,
      );
      BankAccountParentComponent = _classThis = _classDescriptor.value;
      if (_metadata)
        Object.defineProperty(_classThis, Symbol.metadata, {
          enumerable: true,
          configurable: true,
          writable: true,
          value: _metadata,
        });
      __runInitializers(_classThis, _classExtraInitializers);
    }
    width = 200;
    color = 'red';
    isClosed = true;
  };
  return (BankAccountParentComponent = _classThis);
})();
export {BankAccountParentComponent};
// #docregion LightswitchComp
let LightswitchComponent = (() => {
  let _classDecorators = [
    Component({
      selector: 'lightswitch-comp',
      template: ` <button type="button" (click)="clicked()">Click me!</button>
    <span>{{ message }}</span>`,
    }),
  ];
  let _classDescriptor;
  let _classExtraInitializers = [];
  let _classThis;
  var LightswitchComponent = class {
    static {
      _classThis = this;
    }
    static {
      const _metadata =
        typeof Symbol === 'function' && Symbol.metadata ? Object.create(null) : void 0;
      __esDecorate(
        null,
        (_classDescriptor = {value: _classThis}),
        _classDecorators,
        {kind: 'class', name: _classThis.name, metadata: _metadata},
        null,
        _classExtraInitializers,
      );
      LightswitchComponent = _classThis = _classDescriptor.value;
      if (_metadata)
        Object.defineProperty(_classThis, Symbol.metadata, {
          enumerable: true,
          configurable: true,
          writable: true,
          value: _metadata,
        });
      __runInitializers(_classThis, _classExtraInitializers);
    }
    isOn = false;
    clicked() {
      this.isOn = !this.isOn;
    }
    get message() {
      return `The light is ${this.isOn ? 'On' : 'Off'}`;
    }
  };
  return (LightswitchComponent = _classThis);
})();
export {LightswitchComponent};
// #enddocregion LightswitchComp
let Child1Component = (() => {
  let _classDecorators = [
    Component({
      selector: 'child-1',
      template: '<span>Child-1({{text()}})</span>',
    }),
  ];
  let _classDescriptor;
  let _classExtraInitializers = [];
  let _classThis;
  var Child1Component = class {
    static {
      _classThis = this;
    }
    static {
      const _metadata =
        typeof Symbol === 'function' && Symbol.metadata ? Object.create(null) : void 0;
      __esDecorate(
        null,
        (_classDescriptor = {value: _classThis}),
        _classDecorators,
        {kind: 'class', name: _classThis.name, metadata: _metadata},
        null,
        _classExtraInitializers,
      );
      Child1Component = _classThis = _classDescriptor.value;
      if (_metadata)
        Object.defineProperty(_classThis, Symbol.metadata, {
          enumerable: true,
          configurable: true,
          writable: true,
          value: _metadata,
        });
      __runInitializers(_classThis, _classExtraInitializers);
    }
    text = input('Original');
  };
  return (Child1Component = _classThis);
})();
export {Child1Component};
let Child2Component = (() => {
  let _classDecorators = [
    Component({
      selector: 'child-2',
      template: '<div>Child-2({{text()}})</div>',
    }),
  ];
  let _classDescriptor;
  let _classExtraInitializers = [];
  let _classThis;
  var Child2Component = class {
    static {
      _classThis = this;
    }
    static {
      const _metadata =
        typeof Symbol === 'function' && Symbol.metadata ? Object.create(null) : void 0;
      __esDecorate(
        null,
        (_classDescriptor = {value: _classThis}),
        _classDecorators,
        {kind: 'class', name: _classThis.name, metadata: _metadata},
        null,
        _classExtraInitializers,
      );
      Child2Component = _classThis = _classDescriptor.value;
      if (_metadata)
        Object.defineProperty(_classThis, Symbol.metadata, {
          enumerable: true,
          configurable: true,
          writable: true,
          value: _metadata,
        });
      __runInitializers(_classThis, _classExtraInitializers);
    }
    text = input('');
  };
  return (Child2Component = _classThis);
})();
export {Child2Component};
let Child3Component = (() => {
  let _classDecorators = [
    Component({
      selector: 'child-3',
      template: '<div>Child-3({{text}})</div>',
    }),
  ];
  let _classDescriptor;
  let _classExtraInitializers = [];
  let _classThis;
  var Child3Component = class {
    static {
      _classThis = this;
    }
    static {
      const _metadata =
        typeof Symbol === 'function' && Symbol.metadata ? Object.create(null) : void 0;
      __esDecorate(
        null,
        (_classDescriptor = {value: _classThis}),
        _classDecorators,
        {kind: 'class', name: _classThis.name, metadata: _metadata},
        null,
        _classExtraInitializers,
      );
      Child3Component = _classThis = _classDescriptor.value;
      if (_metadata)
        Object.defineProperty(_classThis, Symbol.metadata, {
          enumerable: true,
          configurable: true,
          writable: true,
          value: _metadata,
        });
      __runInitializers(_classThis, _classExtraInitializers);
    }
    text = input('');
  };
  return (Child3Component = _classThis);
})();
export {Child3Component};
let InputComponent = (() => {
  let _classDecorators = [
    Component({
      selector: 'input-comp',
      template: '<input [(ngModel)]="name">',
      imports: [FormsModule],
    }),
  ];
  let _classDescriptor;
  let _classExtraInitializers = [];
  let _classThis;
  var InputComponent = class {
    static {
      _classThis = this;
    }
    static {
      const _metadata =
        typeof Symbol === 'function' && Symbol.metadata ? Object.create(null) : void 0;
      __esDecorate(
        null,
        (_classDescriptor = {value: _classThis}),
        _classDecorators,
        {kind: 'class', name: _classThis.name, metadata: _metadata},
        null,
        _classExtraInitializers,
      );
      InputComponent = _classThis = _classDescriptor.value;
      if (_metadata)
        Object.defineProperty(_classThis, Symbol.metadata, {
          enumerable: true,
          configurable: true,
          writable: true,
          value: _metadata,
        });
      __runInitializers(_classThis, _classExtraInitializers);
    }
    name = signal('John');
  };
  return (InputComponent = _classThis);
})();
export {InputComponent};
let InputValueBinderComponent = (() => {
  let _classDecorators = [
    Component({
      selector: 'input-value-comp',
      template: ` Name: <input [value]="name" /> {{ name }} `,
    }),
  ];
  let _classDescriptor;
  let _classExtraInitializers = [];
  let _classThis;
  var InputValueBinderComponent = class {
    static {
      _classThis = this;
    }
    static {
      const _metadata =
        typeof Symbol === 'function' && Symbol.metadata ? Object.create(null) : void 0;
      __esDecorate(
        null,
        (_classDescriptor = {value: _classThis}),
        _classDecorators,
        {kind: 'class', name: _classThis.name, metadata: _metadata},
        null,
        _classExtraInitializers,
      );
      InputValueBinderComponent = _classThis = _classDescriptor.value;
      if (_metadata)
        Object.defineProperty(_classThis, Symbol.metadata, {
          enumerable: true,
          configurable: true,
          writable: true,
          value: _metadata,
        });
      __runInitializers(_classThis, _classExtraInitializers);
    }
    name = 'Sally'; // initial value
  };
  return (InputValueBinderComponent = _classThis);
})();
export {InputValueBinderComponent};
let ParentComponent = (() => {
  let _classDecorators = [
    Component({
      selector: 'parent-comp',
      imports: [Child1Component],
      template: 'Parent(<child-1></child-1>)',
    }),
  ];
  let _classDescriptor;
  let _classExtraInitializers = [];
  let _classThis;
  var ParentComponent = class {
    static {
      _classThis = this;
    }
    static {
      const _metadata =
        typeof Symbol === 'function' && Symbol.metadata ? Object.create(null) : void 0;
      __esDecorate(
        null,
        (_classDescriptor = {value: _classThis}),
        _classDecorators,
        {kind: 'class', name: _classThis.name, metadata: _metadata},
        null,
        _classExtraInitializers,
      );
      ParentComponent = _classThis = _classDescriptor.value;
      if (_metadata)
        Object.defineProperty(_classThis, Symbol.metadata, {
          enumerable: true,
          configurable: true,
          writable: true,
          value: _metadata,
        });
      __runInitializers(_classThis, _classExtraInitializers);
    }
  };
  return (ParentComponent = _classThis);
})();
export {ParentComponent};
let IoComponent = (() => {
  let _classDecorators = [
    Component({
      selector: 'io-comp',
      template:
        '<button type="button" class="hero" (click)="click()">Original {{hero().name}}</button>',
    }),
  ];
  let _classDescriptor;
  let _classExtraInitializers = [];
  let _classThis;
  var IoComponent = class {
    static {
      _classThis = this;
    }
    static {
      const _metadata =
        typeof Symbol === 'function' && Symbol.metadata ? Object.create(null) : void 0;
      __esDecorate(
        null,
        (_classDescriptor = {value: _classThis}),
        _classDecorators,
        {kind: 'class', name: _classThis.name, metadata: _metadata},
        null,
        _classExtraInitializers,
      );
      IoComponent = _classThis = _classDescriptor.value;
      if (_metadata)
        Object.defineProperty(_classThis, Symbol.metadata, {
          enumerable: true,
          configurable: true,
          writable: true,
          value: _metadata,
        });
      __runInitializers(_classThis, _classExtraInitializers);
    }
    hero = input.required();
    selected = output();
    click() {
      this.selected.emit(this.hero);
    }
  };
  return (IoComponent = _classThis);
})();
export {IoComponent};
let IoParentComponent = (() => {
  let _classDecorators = [
    Component({
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
    }),
  ];
  let _classDescriptor;
  let _classExtraInitializers = [];
  let _classThis;
  var IoParentComponent = class {
    static {
      _classThis = this;
    }
    static {
      const _metadata =
        typeof Symbol === 'function' && Symbol.metadata ? Object.create(null) : void 0;
      __esDecorate(
        null,
        (_classDescriptor = {value: _classThis}),
        _classDecorators,
        {kind: 'class', name: _classThis.name, metadata: _metadata},
        null,
        _classExtraInitializers,
      );
      IoParentComponent = _classThis = _classDescriptor.value;
      if (_metadata)
        Object.defineProperty(_classThis, Symbol.metadata, {
          enumerable: true,
          configurable: true,
          writable: true,
          value: _metadata,
        });
      __runInitializers(_classThis, _classExtraInitializers);
    }
    heroes = [{name: 'Bob'}, {name: 'Carol'}, {name: 'Ted'}, {name: 'Alice'}];
    selectedHero;
    onSelect(hero) {
      this.selectedHero = hero;
    }
  };
  return (IoParentComponent = _classThis);
})();
export {IoParentComponent};
let MyIfComponent = (() => {
  let _classDecorators = [
    Component({
      selector: 'my-if-comp',
      template: 'MyIf(@if (showMore) {<span>More</span>})',
      imports: [sharedImports],
    }),
  ];
  let _classDescriptor;
  let _classExtraInitializers = [];
  let _classThis;
  var MyIfComponent = class {
    static {
      _classThis = this;
    }
    static {
      const _metadata =
        typeof Symbol === 'function' && Symbol.metadata ? Object.create(null) : void 0;
      __esDecorate(
        null,
        (_classDescriptor = {value: _classThis}),
        _classDecorators,
        {kind: 'class', name: _classThis.name, metadata: _metadata},
        null,
        _classExtraInitializers,
      );
      MyIfComponent = _classThis = _classDescriptor.value;
      if (_metadata)
        Object.defineProperty(_classThis, Symbol.metadata, {
          enumerable: true,
          configurable: true,
          writable: true,
          value: _metadata,
        });
      __runInitializers(_classThis, _classExtraInitializers);
    }
    showMore = false;
  };
  return (MyIfComponent = _classThis);
})();
export {MyIfComponent};
let TestProvidersComponent = (() => {
  let _classDecorators = [
    Component({
      selector: 'my-service-comp',
      template: 'injected value: {{valueService.value}}',
      providers: [ValueService],
    }),
  ];
  let _classDescriptor;
  let _classExtraInitializers = [];
  let _classThis;
  var TestProvidersComponent = class {
    static {
      _classThis = this;
    }
    static {
      const _metadata =
        typeof Symbol === 'function' && Symbol.metadata ? Object.create(null) : void 0;
      __esDecorate(
        null,
        (_classDescriptor = {value: _classThis}),
        _classDecorators,
        {kind: 'class', name: _classThis.name, metadata: _metadata},
        null,
        _classExtraInitializers,
      );
      TestProvidersComponent = _classThis = _classDescriptor.value;
      if (_metadata)
        Object.defineProperty(_classThis, Symbol.metadata, {
          enumerable: true,
          configurable: true,
          writable: true,
          value: _metadata,
        });
      __runInitializers(_classThis, _classExtraInitializers);
    }
    valueService = inject(ValueService);
  };
  return (TestProvidersComponent = _classThis);
})();
export {TestProvidersComponent};
let TestViewProvidersComponent = (() => {
  let _classDecorators = [
    Component({
      selector: 'my-service-comp',
      template: 'injected value: {{valueService.value}}',
      viewProviders: [ValueService],
    }),
  ];
  let _classDescriptor;
  let _classExtraInitializers = [];
  let _classThis;
  var TestViewProvidersComponent = class {
    static {
      _classThis = this;
    }
    static {
      const _metadata =
        typeof Symbol === 'function' && Symbol.metadata ? Object.create(null) : void 0;
      __esDecorate(
        null,
        (_classDescriptor = {value: _classThis}),
        _classDecorators,
        {kind: 'class', name: _classThis.name, metadata: _metadata},
        null,
        _classExtraInitializers,
      );
      TestViewProvidersComponent = _classThis = _classDescriptor.value;
      if (_metadata)
        Object.defineProperty(_classThis, Symbol.metadata, {
          enumerable: true,
          configurable: true,
          writable: true,
          value: _metadata,
        });
      __runInitializers(_classThis, _classExtraInitializers);
    }
    valueService = inject(ValueService);
  };
  return (TestViewProvidersComponent = _classThis);
})();
export {TestViewProvidersComponent};
let ExternalTemplateComponent = (() => {
  let _classDecorators = [
    Component({
      selector: 'external-template-comp',
      templateUrl: './demo-external-template.html',
    }),
  ];
  let _classDescriptor;
  let _classExtraInitializers = [];
  let _classThis;
  var ExternalTemplateComponent = class {
    static {
      _classThis = this;
    }
    static {
      const _metadata =
        typeof Symbol === 'function' && Symbol.metadata ? Object.create(null) : void 0;
      __esDecorate(
        null,
        (_classDescriptor = {value: _classThis}),
        _classDecorators,
        {kind: 'class', name: _classThis.name, metadata: _metadata},
        null,
        _classExtraInitializers,
      );
      ExternalTemplateComponent = _classThis = _classDescriptor.value;
      if (_metadata)
        Object.defineProperty(_classThis, Symbol.metadata, {
          enumerable: true,
          configurable: true,
          writable: true,
          value: _metadata,
        });
      __runInitializers(_classThis, _classExtraInitializers);
    }
    service = inject(ValueService, {optional: true});
    serviceValue = this.service?.getValue() ?? '';
  };
  return (ExternalTemplateComponent = _classThis);
})();
export {ExternalTemplateComponent};
let InnerCompWithExternalTemplateComponent = (() => {
  let _classDecorators = [
    Component({
      selector: 'comp-w-ext-comp',
      imports: [ExternalTemplateComponent],
      template: `
    <h3>comp-w-ext-comp</h3>
    <external-template-comp></external-template-comp>
  `,
    }),
  ];
  let _classDescriptor;
  let _classExtraInitializers = [];
  let _classThis;
  var InnerCompWithExternalTemplateComponent = class {
    static {
      _classThis = this;
    }
    static {
      const _metadata =
        typeof Symbol === 'function' && Symbol.metadata ? Object.create(null) : void 0;
      __esDecorate(
        null,
        (_classDescriptor = {value: _classThis}),
        _classDecorators,
        {kind: 'class', name: _classThis.name, metadata: _metadata},
        null,
        _classExtraInitializers,
      );
      InnerCompWithExternalTemplateComponent = _classThis = _classDescriptor.value;
      if (_metadata)
        Object.defineProperty(_classThis, Symbol.metadata, {
          enumerable: true,
          configurable: true,
          writable: true,
          value: _metadata,
        });
      __runInitializers(_classThis, _classExtraInitializers);
    }
  };
  return (InnerCompWithExternalTemplateComponent = _classThis);
})();
export {InnerCompWithExternalTemplateComponent};
let NeedsContentComponent = (() => {
  let _classDecorators = [
    Component({selector: 'needs-content', template: '<ng-content></ng-content>'}),
  ];
  let _classDescriptor;
  let _classExtraInitializers = [];
  let _classThis;
  let _children_decorators;
  let _children_initializers = [];
  let _children_extraInitializers = [];
  var NeedsContentComponent = class {
    static {
      _classThis = this;
    }
    static {
      const _metadata =
        typeof Symbol === 'function' && Symbol.metadata ? Object.create(null) : void 0;
      _children_decorators = [ContentChildren('content')];
      __esDecorate(
        null,
        null,
        _children_decorators,
        {
          kind: 'field',
          name: 'children',
          static: false,
          private: false,
          access: {
            has: (obj) => 'children' in obj,
            get: (obj) => obj.children,
            set: (obj, value) => {
              obj.children = value;
            },
          },
          metadata: _metadata,
        },
        _children_initializers,
        _children_extraInitializers,
      );
      __esDecorate(
        null,
        (_classDescriptor = {value: _classThis}),
        _classDecorators,
        {kind: 'class', name: _classThis.name, metadata: _metadata},
        null,
        _classExtraInitializers,
      );
      NeedsContentComponent = _classThis = _classDescriptor.value;
      if (_metadata)
        Object.defineProperty(_classThis, Symbol.metadata, {
          enumerable: true,
          configurable: true,
          writable: true,
          value: _metadata,
        });
      __runInitializers(_classThis, _classExtraInitializers);
    }
    // children with #content local variable
    children = __runInitializers(this, _children_initializers, void 0);
    constructor() {
      __runInitializers(this, _children_extraInitializers);
    }
  };
  return (NeedsContentComponent = _classThis);
})();
export {NeedsContentComponent};
let ReversePipeComponent = (() => {
  let _classDecorators = [
    Component({
      selector: 'reverse-pipe-comp',
      template: `
    <input [(ngModel)]="text" />
    <span>{{ text | reverse }}</span>
  `,
      imports: [ReversePipe, FormsModule],
    }),
  ];
  let _classDescriptor;
  let _classExtraInitializers = [];
  let _classThis;
  var ReversePipeComponent = class {
    static {
      _classThis = this;
    }
    static {
      const _metadata =
        typeof Symbol === 'function' && Symbol.metadata ? Object.create(null) : void 0;
      __esDecorate(
        null,
        (_classDescriptor = {value: _classThis}),
        _classDecorators,
        {kind: 'class', name: _classThis.name, metadata: _metadata},
        null,
        _classExtraInitializers,
      );
      ReversePipeComponent = _classThis = _classDescriptor.value;
      if (_metadata)
        Object.defineProperty(_classThis, Symbol.metadata, {
          enumerable: true,
          configurable: true,
          writable: true,
          value: _metadata,
        });
      __runInitializers(_classThis, _classExtraInitializers);
    }
    text = 'my dog has fleas.';
  };
  return (ReversePipeComponent = _classThis);
})();
export {ReversePipeComponent};
let ShellComponent = (() => {
  let _classDecorators = [
    Component({
      imports: [NeedsContentComponent],
      template: '<div>Replace Me</div>',
    }),
  ];
  let _classDescriptor;
  let _classExtraInitializers = [];
  let _classThis;
  var ShellComponent = class {
    static {
      _classThis = this;
    }
    static {
      const _metadata =
        typeof Symbol === 'function' && Symbol.metadata ? Object.create(null) : void 0;
      __esDecorate(
        null,
        (_classDescriptor = {value: _classThis}),
        _classDecorators,
        {kind: 'class', name: _classThis.name, metadata: _metadata},
        null,
        _classExtraInitializers,
      );
      ShellComponent = _classThis = _classDescriptor.value;
      if (_metadata)
        Object.defineProperty(_classThis, Symbol.metadata, {
          enumerable: true,
          configurable: true,
          writable: true,
          value: _metadata,
        });
      __runInitializers(_classThis, _classExtraInitializers);
    }
  };
  return (ShellComponent = _classThis);
})();
export {ShellComponent};
let DemoComponent = (() => {
  let _classDecorators = [
    Component({
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
    }),
  ];
  let _classDescriptor;
  let _classExtraInitializers = [];
  let _classThis;
  var DemoComponent = class {
    static {
      _classThis = this;
    }
    static {
      const _metadata =
        typeof Symbol === 'function' && Symbol.metadata ? Object.create(null) : void 0;
      __esDecorate(
        null,
        (_classDescriptor = {value: _classThis}),
        _classDecorators,
        {kind: 'class', name: _classThis.name, metadata: _metadata},
        null,
        _classExtraInitializers,
      );
      DemoComponent = _classThis = _classDescriptor.value;
      if (_metadata)
        Object.defineProperty(_classThis, Symbol.metadata, {
          enumerable: true,
          configurable: true,
          writable: true,
          value: _metadata,
        });
      __runInitializers(_classThis, _classExtraInitializers);
    }
  };
  return (DemoComponent = _classThis);
})();
export {DemoComponent};
//////// Aggregations ////////////
export const demoProviders = [MasterService, ValueService];
//# sourceMappingURL=demo.js.map
