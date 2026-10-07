# /tsconfig.json
```json
{
  "compilerOptions": {
    "strict": true
  },
  "files": ["host.component.ts"]
}
```

# /host.component.ts
```ts
import { Component, Input, forwardRef } from '@angular/core';

@Component({
  selector: 'app-host',
  standalone: true,
  imports: [forwardRef(() => TargetComponent)],
  template: '<app-target [value]="42"></app-target>',
})
export class HostComponent {}

@Component({
  selector: 'app-target',
  standalone: true,
  template: '<span>Target</span>',
})
export class TargetComponent {
  @Input() value!: string;
}
```
