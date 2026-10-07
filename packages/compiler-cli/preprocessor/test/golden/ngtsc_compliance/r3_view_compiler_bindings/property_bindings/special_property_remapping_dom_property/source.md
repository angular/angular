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
    "special_property_remapping_dom_property.ts"
  ],
  "angularCompilerOptions": {}
}
```

# /special_property_remapping_dom_property.ts
```ts
import {Component} from '@angular/core';

@Component({
  template: `<label [for]="forValue"></label>`,
})
export class MyComponent {
  forValue = 'some-input';
}
```
