# /tsconfig.json
```json
{
  "compilerOptions": {
    "strict": true
  },
  "files": ["app.component.ts"]
}
```

# /app.component.ts
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

export class ChildComponent {}

@Component({
  selector: 'jit-cmp',
  template: '<div>JIT</div>',
  standalone: true,
  jit: true,
})
export class JitComponent {
  sigInput = input('default');
  reqInput = input.required<string>();
  aliasedInput = input('val', {alias: 'publicName'});

  sigOutput = output<string>();
  aliasedOutput = output({alias: 'customEvent'});

  sigModel = model(123);
  aliasedModel = model('str', {alias: 'publicModel'});

  sigViewChild = viewChild<ElementRef>('el');
  sigViewChildForward = viewChild(forwardRef(() => ChildComponent));
  sigViewChildren = viewChildren<ElementRef>('item');

  sigContentChild = contentChild<ElementRef>('contentEl');
  sigContentChildren = contentChildren<ElementRef>('contentItem');
}

@Directive({
  selector: '[jitDir]',
  standalone: true,
  jit: true,
})
export class JitDirective {
  dirInput = input<boolean>(false);
  dirOutput = output<number>();
  dirModel = model<string>('');
}
```
