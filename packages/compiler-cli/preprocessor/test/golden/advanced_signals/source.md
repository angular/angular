# /tsconfig.json
```json
{
  "compilerOptions": {
    "strict": true
  },
  "files": ["test.ts"]
}
```

# /test.ts
```ts
import { Component, input, model, output } from '@angular/core';
import * as core from '@angular/core';
import { outputFromObservable } from '@angular/core/rxjs-interop';
import * as rx from '@angular/core/rxjs-interop';
import { Observable } from 'rxjs';

@Component({
  selector: 'advanced-comp',
  template: '<div>Advanced Component</div>',
  standalone: true,
  signals: true
})
export class AdvancedComp {
  // Direct function calls
  directInput = input<string>('initial');
  directRequiredInput = input.required<number>();
  directModel = model(0);
  directRequiredModel = model.required<boolean>();
  directOutput = output();
  directOutputObs = outputFromObservable(new Observable<string>());

  // Namespaced calls
  nsInput = core.input<number>(42);
  nsRequiredInput = core.input.required<string>();
  nsModel = core.model(true);
  nsRequiredModel = core.model.required<number>();
  nsOutput = core.output();
  nsOutputObs = rx.outputFromObservable(new Observable<number>());

  // Queries (both direct and namespaced)
  directViewChild = core.viewChild<string>('tpl');
  directRequiredViewChild = core.viewChild.required<string>('tpl');
  directViewChildren = core.viewChildren<string>('tpl');
  directContentChild = core.contentChild<string>('tpl');
  directRequiredContentChild = core.contentChild.required<string>('tpl');
  directContentChildren = core.contentChildren<string>('tpl');
}
```
