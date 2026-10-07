# /tsconfig.json
```json
{
  "compilerOptions": {
    "target": "ES2022",
    "module": "ES2022",
    "moduleResolution": "bundler",
    "declaration": true,
    "experimentalDecorators": true
  },
  "files": [
    "directive.ts",
    "upstream-module.ts",
    "consumer.ts"
  ]
}
```

# /directive.ts
```ts
import { Directive } from '@angular/core';

@Directive({
  selector: '[dirA]',
  standalone: false,
})
class DirectiveA {}

export { DirectiveA as PublicDirectiveA };
```

# /upstream-module.ts
```ts
import { NgModule } from '@angular/core';
import { PublicDirectiveA } from './directive';

@NgModule({
  declarations: [PublicDirectiveA],
  exports: [PublicDirectiveA],
})
export class UpstreamModule {}
```

# /consumer.ts
```ts
import { Component } from '@angular/core';
import { UpstreamModule } from './upstream-module';

@Component({
  selector: 'consumer-cmp',
  template: '<div dirA></div>',
  imports: [UpstreamModule],
  standalone: true,
})
export class ConsumerComponent {}
```
