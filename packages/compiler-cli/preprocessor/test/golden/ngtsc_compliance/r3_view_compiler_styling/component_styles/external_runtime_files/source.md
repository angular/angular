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
    "external_runtime_files.ts"
  ],
  "angularCompilerOptions": {
    "externalRuntimeStyles": true
  }
}
```

# /external_runtime_files.ts
```ts
import {Component, NgModule, ViewEncapsulation} from '@angular/core';

@Component({
  selector: 'my-component',
  encapsulation: ViewEncapsulation.Emulated,
  styleUrls: ['./style-A.css', './style-B.css'],
  template: '...',
  standalone: false,
})
export class MyComponent {
}

@NgModule({declarations: [MyComponent]})
export class MyModule {
}
```

# /style-A.css
```css
div.bar { color: blue; }
```

# /style-B.css
```css
div.baz { color: purple; }
```
