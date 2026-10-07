# /tsconfig.json
```json
{
  "compilerOptions": {
    "strict": true,
    "target": "es2022",
    "module": "es2022",
    "moduleResolution": "node"
  },
  "files": [
    "src/app/app.component.ts",
    "src/directives/consumer_dir.d.ts",
    "src/directives/host_dir.d.ts"
  ]
}
```

# /src/directives/host_dir.d.ts
```ts
import * as i0 from '@angular/core';

export declare class TestHostDirective {
  customChange: i0.EventEmitter<boolean>;
  static ɵfac: i0.ɵɵFactoryDeclaration<TestHostDirective, never>;
  static ɵdir: i0.ɵɵDirectiveDeclaration<
    TestHostDirective,
    never,
    never,
    {},
    { 'customChange': 'customChange' },
    never,
    never,
    true
  >;
}
```

# /src/directives/consumer_dir.d.ts
```ts
import * as i0 from '@angular/core';
import * as i1 from './host_dir';

export declare class TestHostConsumerDirective {
  static ɵfac: i0.ɵɵFactoryDeclaration<TestHostConsumerDirective, never>;
  static ɵdir: i0.ɵɵDirectiveDeclaration<
    TestHostConsumerDirective,
    '[testHostConsumer]',
    never,
    {},
    {},
    never,
    never,
    true,
    [{
      directive: typeof i1.TestHostDirective;
      inputs: {};
      outputs: {
        'customChange': 'disabledChange';
      };
    }]
  >;
}
```

# /src/app/app.component.ts
```ts
import { Component } from '@angular/core';
import { TestHostConsumerDirective } from '../directives/consumer_dir';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [TestHostConsumerDirective],
  template: '<div testHostConsumer (disabledChange)="onDisabledChange($event)"></div>',
})
export class AppComponent {
  onDisabledChange(val: boolean) {}
}
```
