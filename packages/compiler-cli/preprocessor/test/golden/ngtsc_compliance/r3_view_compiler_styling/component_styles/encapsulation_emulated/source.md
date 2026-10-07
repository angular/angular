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
    "encapsulation_emulated.ts"
  ],
  "angularCompilerOptions": {}
}
```

# /encapsulation_emulated.ts
```ts
import {Component, NgModule, ViewEncapsulation} from '@angular/core';

@Component({
  selector: 'my-component',
  encapsulation: ViewEncapsulation.Emulated,
  standalone: false,
  styles: [
    'div.foo { color: red; }', ':host p:nth-child(even) { --webkit-transition: 1s linear all; }'
  ],
  styleUrls: ['./style-A.css', './style-B.css'],
  template: '...'
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
