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
    "unique_listener_function_names.ts"
  ],
  "angularCompilerOptions": {}
}
```

# /unique_listener_function_names.ts
```ts
import {Component, NgModule} from '@angular/core';

@Component({
    selector: 'my-component',
    template: `
    <div *ngFor="let item of items">
      <p (click)="$event">{{ item }}</p>
      <p (click)="$event">{{ item }}</p>
    </div>
    <div *ngFor="let item of items">
      <p (click)="$event">{{ item }}</p>
    </div>
  `,
    standalone: false
})
export class MyComponent {
  items = [4, 2];
}

@NgModule({declarations: [MyComponent]})
export class MyModule {
}
```
