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
    "src/common/common_builder.ts",
    "src/builders/condition_group_builder.ts"
  ]
}
```

# /src/common/common_builder.ts
```ts
import { Directive, EventEmitter, Output } from '@angular/core';

@Directive()
export abstract class CommonConditionGroupBuilder {
  @Output() onCelCodeUpdated = new EventEmitter<string>();
}
```

# /src/builders/condition_group_builder.ts
```ts
import { Component } from '@angular/core';
import { CommonConditionGroupBuilder } from 'app/common/common_builder';

@Component({
  standalone: true,
  selector: 'condition-group-builder',
  template: `
    <condition-group-builder (onCelCodeUpdated)="handleUpdate($event)">
    </condition-group-builder>
  `,
})
export class ConditionGroupBuilder extends CommonConditionGroupBuilder {
  handleUpdate(code: string): void {}
}
```
