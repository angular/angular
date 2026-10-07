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
import { Component, Directive, model, output } from '@angular/core';
import { outputFromObservable } from '@angular/core/rxjs-interop';
import { Observable } from 'rxjs';

@Directive({
  selector: '[signalDir]',
  standalone: false,
  signals: true
})
export class SignalDir {}

@Component({
  selector: 'signal-comp',
  template: '<div>Signal Component</div>',
  standalone: false,
  signals: true
})
export class SignalComp {
  val = model(0);
  custom = model(false, { alias: 'customAlias' });
  submit = output();
  obs = outputFromObservable(new Observable<number>());
  obsCustom = outputFromObservable(new Observable<string>(), { alias: 'obsAlias' });
}

@Component({
  selector: 'standalone-signal-comp',
  template: '<div>Standalone Signal Component</div>',
  standalone: true,
  signals: true
})
export class StandaloneSignalComp {}
```
