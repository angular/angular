# /tsconfig.json
```json
{
  "compilerOptions": {
    "target": "es2022",
    "module": "esnext",
    "experimentalDecorators": true,
    "emitDecoratorMetadata": false,
    "moduleResolution": "node"
  },
  "files": [
    "a.component.ts",
    "b.component.ts",
    "c_helper.ts",
    "app.module.ts"
  ],
  "angularCompilerOptions": {}
}
```

# /a.component.ts
```ts
import {Component} from '@angular/core';

export const GREETING = 'Hello from A';

@Component({
  selector: 'comp-a',
  template: '<comp-b></comp-b>',
  standalone: false,
})
export class CompA {}
```

# /b.component.ts
```ts
import {Component} from '@angular/core';
import {formatMessage} from './c_helper';

@Component({
  selector: 'comp-b',
  template: '<div>{{ message }}</div>',
  standalone: false,
})
export class CompB {
  message = formatMessage('World');
}
```

# /c_helper.ts
```ts
import {GREETING} from './a.component';

export function formatMessage(name: string): string {
  return `${GREETING}, ${name}!`;
}
```

# /app.module.ts
```ts
import {NgModule} from '@angular/core';
import {CompA} from './a.component';
import {CompB} from './b.component';

@NgModule({
  declarations: [CompA, CompB],
  exports: [CompA, CompB],
})
export class AppModule {}
```
