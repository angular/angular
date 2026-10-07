# /out/mixed_variants.ts
```ts
import { Directive, EventEmitter, Output, output } from '@angular/core';
import { outputFromObservable } from '@angular/core/rxjs-interop';
// @ts-ignore
import * as i0 from '@angular/core';

export class TestDir {
  click1 = output();
  click2 = output<boolean>();
  click3 = outputFromObservable(new EventEmitter<number>());
  _bla = output<void>({ alias: 'decoratorPublicName' });
  _bla2 = outputFromObservable(new EventEmitter(), { alias: 'decoratorPublicName2' });

  clickDecorator1 = new EventEmitter();
  clickDecorator2 = new EventEmitter<boolean>();
  _blaDecorator = new EventEmitter<void>();
  // @ts-ignore
  static ɵfac: i0.ɵɵFactoryDeclaration<TestDir, never> = function TestDir_Factory(
    __ngFactoryType__: any,
  ): any {
    return new (__ngFactoryType__ || TestDir)();
  };
  // @ts-ignore
  static ɵdir: i0.ɵɵDirectiveDeclaration<
    TestDir,
    never,
    never,
    {},
    {
      'click1': 'click1';
      'click2': 'click2';
      'click3': 'click3';
      '_bla': 'decoratorPublicName';
      '_bla2': 'decoratorPublicName2';
      'clickDecorator1': 'clickDecorator1';
      'clickDecorator2': 'clickDecorator2';
      '_blaDecorator': 'decoratorPublicName3';
    },
    never,
    never,
    true,
    never
  > = /*@__PURE__*/ i0.ɵɵdefineDirective({
    type: TestDir,
    outputs: {
      click1: 'click1',
      click2: 'click2',
      click3: 'click3',
      _bla: 'decoratorPublicName',
      _bla2: 'decoratorPublicName2',
      clickDecorator1: 'clickDecorator1',
      clickDecorator2: 'clickDecorator2',
      _blaDecorator: 'decoratorPublicName3',
    },
  });
  static {
    (typeof ngDevMode === 'undefined' || ngDevMode) &&
      i0.ɵsetClassMetadata(TestDir, [{ type: Directive }], null, {
        clickDecorator1: [{ type: Output }],
        clickDecorator2: [{ type: Output }],
        _blaDecorator: [{ type: Output, args: ['decoratorPublicName3'] }],
        click1: [{ type: i0.Output, args: ['click1'] }],
        click2: [{ type: i0.Output, args: ['click2'] }],
        click3: [{ type: i0.Output, args: ['click3'] }],
        _bla: [{ type: i0.Output, args: ['decoratorPublicName'] }],
        _bla2: [{ type: i0.Output, args: ['decoratorPublicName2'] }],
      });
  }
}

```