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
    "encapsulation_default.ts"
  ],
  "angularCompilerOptions": {}
}
```

# /encapsulation_default.ts
```ts
import {Component, NgModule} from '@angular/core';

@Component({
    selector: 'my-component',
    styles: [
        'div.foo { color: red; }', ':host p:nth-child(even) { --webkit-transition: 1s linear all; }'
    ],
    template: '...',
    standalone: false
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
