# /tsconfig.json

```json
{
  "compilerOptions": {
    "strict": true
  },
  "files": ["app.component.ts"]
}
```

# /node_modules/@angular/core/package.json

```json
{
  "name": "@angular/core",
  "types": "./index.d.ts"
}
```

# /node_modules/@angular/core/index.d.ts

```ts
export declare enum ViewEncapsulation {
  Emulated = 0,
  None = 2,
  ShadowDom = 3,
  ExperimentalIsolatedShadowDom = 4
}
export declare enum ChangeDetectionStrategy {
  OnPush = 0,
  Default = 1
}
export declare const Component: any;
```

# /app.component.ts

```ts
import {
  Component,
  ViewEncapsulation as VE,
  ChangeDetectionStrategy as CD,
} from '@angular/core';

@Component({
  selector: 'aliased-cmp',
  template: '<div>Aliased</div>',
  styles: ['div { color: red; }'],
  encapsulation: VE.None,
  changeDetection: CD.Default,
})
export class AliasedCmp {}
```

