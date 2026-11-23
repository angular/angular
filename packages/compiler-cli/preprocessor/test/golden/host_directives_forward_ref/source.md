# /tsconfig.json
```json
{
  "compilerOptions": {
    "strict": true
  },
  "files": ["test.ts"]
}
```

# /test.ts
```ts
import { Component, Directive, forwardRef } from '@angular/core';

@Component({
  selector: 'host-dir-comp',
  template: 'Host Directives',
  hostDirectives: [
    forwardRef(() => ExplicitForwardDirective),
    {
      directive: forwardRef(() => ExplicitObjectForwardDirective),
      inputs: ['inputName: inputAlias']
    },
    ImplicitForwardDirective
  ]
})
export class HostDirComponent {}

@Directive({ selector: '[explicit-fwd]', standalone: true })
export class ExplicitForwardDirective {}

@Directive({ selector: '[explicit-obj-fwd]', standalone: true })
export class ExplicitObjectForwardDirective {}

@Directive({ selector: '[implicit-fwd]', standalone: true })
export class ImplicitForwardDirective {}
```
