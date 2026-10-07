# /tsconfig.json
```json
{
  "compilerOptions": {
    "strict": true,
    "baseUrl": ".",
    "paths": {
      "app/*": ["src/*"]
    },
    "ignoreDeprecations": "6.0"
  },
  "files": [
    "src/panels/forward_ref_panel.ts",
    "src/modules/forward_ref_module.ts"
  ]
}
```

# /src/panels/forward_ref_panel.ts
```ts
import { Component, Pipe, PipeTransform } from '@angular/core';

@Component({
  standalone: false,
  selector: 'forward-ref-panel',
  template: '<div>{{ "test" | forwardRefPipe }}</div>',
})
export class ForwardRefPanel {}

@Pipe({
  standalone: false,
  name: 'forwardRefPipe',
})
export class ForwardRefPipe implements PipeTransform {
  transform(value: string): string {
    return value;
  }
}
```

# /src/modules/forward_ref_module.ts
```ts
import { NgModule } from '@angular/core';
import { ForwardRefPanel, ForwardRefPipe } from 'app/panels/forward_ref_panel';

@NgModule({
  declarations: [ForwardRefPanel, ForwardRefPipe],
  exports: [ForwardRefPanel],
})
export class ForwardRefModule {}
```
