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
  standalone: true,
  jit: true,
})
export class JitComponent {
  @i0.Input({ isSignal: true, alias: 'sigInput', required: false } as any) sigInput = input(
    'default',
    ...((ngDevMode ? [{ debugName: 'sigInput' }] : /* istanbul ignore next */ []) as []),
  );
  @i0.Input({ isSignal: true, alias: 'reqInput', required: true } as any) reqInput =
    input.required<string>(
      ...((ngDevMode ? [{ debugName: 'reqInput' }] : /* istanbul ignore next */ []) as []),
    );
  @i0.Input({ isSignal: true, alias: 'publicName', required: false } as any) aliasedInput = input(
    'val',
    {
      ...(ngDevMode ? { debugName: 'aliasedInput' } : /* istanbul ignore next */ {}),
      alias: 'publicName',
    },
  );

  @i0.Output('sigOutput') sigOutput = output<string>();
  @i0.Output('customEvent') aliasedOutput = output({ alias: 'customEvent' });

  @i0.Input({ isSignal: true, alias: 'sigModel', required: false } as any)
  @i0.Output('sigModelChange')
  sigModel = model(
    123,
    ...((ngDevMode ? [{ debugName: 'sigModel' }] : /* istanbul ignore next */ []) as []),
  );
  @i0.Input({ isSignal: true, alias: 'publicModel', required: false } as any)
  @i0.Output('publicModelChange')
  aliasedModel = model('str', {
    ...(ngDevMode ? { debugName: 'aliasedModel' } : /* istanbul ignore next */ {}),
    alias: 'publicModel',
  });

  @i0.ViewChild('el', { isSignal: true } as any) sigViewChild = viewChild<ElementRef>(
    'el',
    ...((ngDevMode ? [{ debugName: 'sigViewChild' }] : /* istanbul ignore next */ []) as []),
  );
  @i0.ViewChild(i0.forwardRef(() => ChildComponent), { isSignal: true } as any)
  sigViewChildForward = viewChild(
    forwardRef(() => ChildComponent),
    ...((ngDevMode ? [{ debugName: 'sigViewChildForward' }] : /* istanbul ignore next */ []) as []),
  );
  @i0.ViewChildren('item', { isSignal: true } as any) sigViewChildren = viewChildren<ElementRef>(
    'item',
    ...((ngDevMode ? [{ debugName: 'sigViewChildren' }] : /* istanbul ignore next */ []) as []),
  );

  @i0.ContentChild('contentEl', { isSignal: true, descendants: true } as any) sigContentChild =
    contentChild<ElementRef>(
      'contentEl',
      ...((ngDevMode ? [{ debugName: 'sigContentChild' }] : /* istanbul ignore next */ []) as []),
    );
  @i0.ContentChildren('contentItem', { isSignal: true } as any) sigContentChildren =
    contentChildren<ElementRef>(
      'contentItem',
      ...((ngDevMode
        ? [{ debugName: 'sigContentChildren' }]
        : /* istanbul ignore next */ []) as []),
    );
}

@Directive({
  selector: '[jitDir]',
  standalone: true,
  jit: true,
})
export class JitDirective {
  @i0.Input({ isSignal: true, alias: 'dirInput', required: false } as any) dirInput =
    input<boolean>(
      false,
      ...((ngDevMode ? [{ debugName: 'dirInput' }] : /* istanbul ignore next */ []) as []),
    );
  @i0.Output('dirOutput') dirOutput = output<number>();
  @i0.Input({ isSignal: true, alias: 'dirModel', required: false } as any)
  @i0.Output('dirModelChange')
  dirModel = model<string>(
    '',
    ...((ngDevMode ? [{ debugName: 'dirModel' }] : /* istanbul ignore next */ []) as []),
  );
}

```