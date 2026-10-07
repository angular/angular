# /tsconfig.json
```json
{
  "compilerOptions": {
    "strict": true,
    "baseUrl": ".",
    "paths": {
      "repo/*": ["src/*", "generated/*", "extra/*"]
    },
    "rootDirs": ["src", "generated", "extra"]
  },
  "angularCompilerOptions": {
    "workspaceName": "repo"
  },
  "files": [
    "src/app/parent.component.ts",
    "generated/button.component.ts",
    "extra/pipes/format.pipe.ts"
  ]
}
```

# /src/app/parent.component.ts
```ts
import { Component } from '@angular/core';
import { ButtonComponent } from '../../generated/button.component';
import { FormatPipe } from '../../extra/pipes/format.pipe';

@Component({
  selector: 'parent-comp',
  imports: [ButtonComponent, FormatPipe],
  template: '<btn></btn><span>{{ "hello" | format }}</span>',
  standalone: true,
})
export class ParentComponent {}
```

# /generated/button.component.ts
```ts
import { Component } from '@angular/core';

@Component({
  selector: 'btn',
  template: '<button>Click</button>',
  standalone: true,
})
export class ButtonComponent {}
```

# /extra/pipes/format.pipe.ts
```ts
import { Pipe, PipeTransform } from '@angular/core';

@Pipe({
  name: 'format',
  standalone: true,
})
export class FormatPipe implements PipeTransform {
  transform(value: string): string {
    return value.toUpperCase();
  }
}
```
