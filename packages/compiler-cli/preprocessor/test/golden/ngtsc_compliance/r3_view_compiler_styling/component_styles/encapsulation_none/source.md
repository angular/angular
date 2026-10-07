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
    "encapsulation_none.ts"
  ],
  "angularCompilerOptions": {}
}
```

# /encapsulation_none.ts
```ts
import {Component, NgModule, ViewEncapsulation} from '@angular/core';

@Component({
    selector: 'my-component',
    encapsulation: ViewEncapsulation.None,
    styles: ['div.tall { height: 123px; }', ':host.small p { height:5px; }'],
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
