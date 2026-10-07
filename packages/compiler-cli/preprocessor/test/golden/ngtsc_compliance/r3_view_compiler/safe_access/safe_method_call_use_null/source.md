# /tsconfig.json
```json
{
  "compilerOptions": {
    "target": "es2020",
    "module": "esnext",
    "experimentalDecorators": true,
    "emitDecoratorMetadata": false,
    "moduleResolution": "node"
  },
  "files": [
    "safe_method_call_use_null.ts"
  ],
  "angularCompilerOptions": {
    "legacyOptionalChaining": true
  }
}
```

# /safe_method_call_use_null.ts
```ts
import {Component} from '@angular/core';

@Component({
    template: `
    <span [title]="person?.getName(false)"></span>
    <span [title]="person?.getName(false) || ''"></span>
    <span [title]="person?.getName(false)?.toLowerCase()"></span>
    <span [title]="person?.getName(config.get('title')?.enabled)"></span>
    <span [title]="person?.getName(config.get('title')?.enabled ?? true)"></span>
`,
    standalone: false
})
export class MyApp {
  person?: {getName: (includeTitle: boolean|undefined) => string;};
  config: {
    get: (name: string) => {enabled: boolean} | undefined;
  } = {get: () => undefined}
}
```
