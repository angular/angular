# /out/app.component.ts
```ts
import {
  Component,
  Directive,
  Input,
  Output,
  ViewChild,
  ViewChildren,
  ContentChild,
  ContentChildren,
  input,
  output,
  model,
  viewChild,
  viewChildren,
  contentChild,
  contentChildren,
  ElementRef,
  forwardRef,
} from '@angular/core';
// @ts-ignore
import * as i0 from '@angular/core';

export class ChildComponent {}

@Component({
  selector: 'jit-cmp',
  template: '<div>JIT</div>',
  jit: true,
})
export class JitComponent {
  sigInput = input(
    'default',
    ...((ngDevMode ? [{ debugName: 'sigInput' }] : /* istanbul ignore next */ []) as []),
  );
  reqInput = input.required<string>(
    ...((ngDevMode ? [{ debugName: 'reqInput' }] : /* istanbul ignore next */ []) as []),
  );
  aliasedInput = input('val', {
    ...(ngDevMode ? { debugName: 'aliasedInput' } : /* istanbul ignore next */ {}),
    alias: 'publicName',
  });
  transformedInput = input('', {
    ...(ngDevMode ? { debugName: 'transformedInput' } : /* istanbul ignore next */ {}),
    transform: (v: string) => v.trim(),
  });

  sigOutput = output<string>();
  aliasedOutput = output({ alias: 'customEvent' });

  sigModel = model(
    123,
    ...((ngDevMode ? [{ debugName: 'sigModel' }] : /* istanbul ignore next */ []) as []),
  );
  aliasedModel = model('str', {
    ...(ngDevMode ? { debugName: 'aliasedModel' } : /* istanbul ignore next */ {}),
    alias: 'publicModel',
  });

  sigViewChild = viewChild<ElementRef>(
    'el',
    ...((ngDevMode ? [{ debugName: 'sigViewChild' }] : /* istanbul ignore next */ []) as []),
  );
  sigViewChildForward = viewChild(
    forwardRef(() => ChildComponent),
    ...((ngDevMode ? [{ debugName: 'sigViewChildForward' }] : /* istanbul ignore next */ []) as []),
  );
  sigViewChildren = viewChildren<ElementRef>(
    'item',
    ...((ngDevMode ? [{ debugName: 'sigViewChildren' }] : /* istanbul ignore next */ []) as []),
  );

  sigContentChild = contentChild<ElementRef>(
    'contentEl',
    ...((ngDevMode ? [{ debugName: 'sigContentChild' }] : /* istanbul ignore next */ []) as []),
  );
  sigContentChildren = contentChildren<ElementRef>(
    'contentItem',
    ...((ngDevMode ? [{ debugName: 'sigContentChildren' }] : /* istanbul ignore next */ []) as []),
  );

  // @ts-ignore
  static propDecorators: any = {
    sigInput: [{ type: i0.Input, args: [{ isSignal: true, alias: 'sigInput', required: false }] }],
    reqInput: [{ type: i0.Input, args: [{ isSignal: true, alias: 'reqInput', required: true }] }],
    aliasedInput: [
      { type: i0.Input, args: [{ isSignal: true, alias: 'publicName', required: false }] },
    ],
    transformedInput: [
      { type: i0.Input, args: [{ isSignal: true, alias: 'transformedInput', required: false }] },
    ],
    sigOutput: [{ type: i0.Output, args: ['sigOutput'] }],
    aliasedOutput: [{ type: i0.Output, args: ['customEvent'] }],
    sigModel: [
      { type: i0.Input, args: [{ isSignal: true, alias: 'sigModel', required: false }] },
      { type: i0.Output, args: ['sigModelChange'] },
    ],
    aliasedModel: [
      { type: i0.Input, args: [{ isSignal: true, alias: 'publicModel', required: false }] },
      { type: i0.Output, args: ['publicModelChange'] },
    ],
    sigViewChild: [{ type: i0.ViewChild, args: ['el', { isSignal: true }] }],
    sigViewChildForward: [
      { type: i0.ViewChild, args: [forwardRef(() => ChildComponent), { isSignal: true }] },
    ],
    sigViewChildren: [{ type: i0.ViewChildren, args: ['item', { isSignal: true }] }],
    sigContentChild: [{ type: i0.ContentChild, args: ['contentEl', { isSignal: true }] }],
    sigContentChildren: [{ type: i0.ContentChildren, args: ['contentItem', { isSignal: true }] }],
  };
}

@Directive({
  selector: '[jitDir]',
  jit: true,
})
export class JitDirective {
  dirInput = input<boolean>(
    false,
    ...((ngDevMode ? [{ debugName: 'dirInput' }] : /* istanbul ignore next */ []) as []),
  );
  dirOutput = output<number>();
  dirModel = model<string>(
    '',
    ...((ngDevMode ? [{ debugName: 'dirModel' }] : /* istanbul ignore next */ []) as []),
  );

  // @ts-ignore
  static propDecorators: any = {
    dirInput: [{ type: i0.Input, args: [{ isSignal: true, alias: 'dirInput', required: false }] }],
    dirOutput: [{ type: i0.Output, args: ['dirOutput'] }],
    dirModel: [
      { type: i0.Input, args: [{ isSignal: true, alias: 'dirModel', required: false }] },
      { type: i0.Output, args: ['dirModelChange'] },
    ],
  };
}
```