# /tsconfig.json
```json
{
  "compilerOptions": {
    "strict": true
  },
  "files": ["io_array.component.ts", "app.component.ts"]
}
```

# /io_array.component.ts
```ts
import { Component, EventEmitter } from '@angular/core';

@Component({
  selector: 'app-io-array',
  template: '<div>Hello {{name}}!</div>',
  inputs: ['name', 'aliasInput: publicName'],
  outputs: ['emitter', 'aliasOutput: publicEmitter'],
  standalone: true
})
export class IoArrayComponent {
  name!: string;
  aliasInput!: string;
  emitter = new EventEmitter<void>();
  aliasOutput = new EventEmitter<number>();
}
```

# /app.component.ts
```ts
import { Component } from '@angular/core';
import { IoArrayComponent } from './io_array.component';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [IoArrayComponent],
  template: `
    <app-io-array
      [name]="'TestName'"
      [publicName]="'TestAlias'"
      (emitter)="handleEmitter()"
      (publicEmitter)="handleAliasEmitter($event)"
    ></app-io-array>
  `
})
export class AppComponent {
  handleEmitter() {}
  handleAliasEmitter(v: number) {}
}
```
