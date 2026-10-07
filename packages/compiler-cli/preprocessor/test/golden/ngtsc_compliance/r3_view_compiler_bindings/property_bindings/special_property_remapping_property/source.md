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
    "special_property_remapping_property.ts"
  ],
  "angularCompilerOptions": {}
}
```

# /special_property_remapping_property.ts
```ts
import {Component, NgModule} from '@angular/core';

@Component({
  selector: 'my-component',
  template: `<label [for]="forValue"></label>`,
  standalone: false,
})
export class MyComponent {
  forValue = 'some-input';
}

@NgModule({declarations: [MyComponent]})
export class MyModule {}
```
