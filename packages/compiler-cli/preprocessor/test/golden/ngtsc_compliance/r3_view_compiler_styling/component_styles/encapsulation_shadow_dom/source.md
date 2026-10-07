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
    "encapsulation_shadow_dom.ts"
  ],
  "angularCompilerOptions": {}
}
```

# /encapsulation_shadow_dom.ts
```ts
import {Component, NgModule, ViewEncapsulation} from '@angular/core';

@Component({
    encapsulation: ViewEncapsulation.ShadowDom,
    selector: 'my-component',
    styles: ['div.cool { color: blue; }', ':host.nice p { color: gold; }'],
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
