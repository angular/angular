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
    "binding_slots_interpolations.ts"
  ],
  "angularCompilerOptions": {}
}
```

# /binding_slots_interpolations.ts
```ts
import {Component, NgModule} from '@angular/core';

@Component({
    selector: 'my-component',
    template: `<div style="opacity:1"
                   [attr.style]="'border-width: 10px'"
                   [style.width]="myWidth"
                   [style]="myStyleExp"
                   [style.height]="myHeight"></div>`,
    standalone: false
})
export class MyComponent {
  myStyleExp = [{color: 'red'}, {color: 'blue', duration: 1000}]
  myWidth = '100px';
  myHeight = '100px';
}

@NgModule({declarations: [MyComponent]})
export class MyModule {
}
```
