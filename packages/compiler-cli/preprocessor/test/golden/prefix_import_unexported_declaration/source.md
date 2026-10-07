# /tsconfig.json
```json
{
  "compilerOptions": {
    "target": "ES2022",
    "module": "ES2022",
    "moduleResolution": "bundler",
    "declaration": true,
    "experimentalDecorators": true,
    "baseUrl": ".",
    "paths": {
      "google3/*": ["*"]
    },
    "rootDirs": ["."]
  },
  "angularCompilerOptions": {
    "workspaceName": "google3"
  },
  "files": [
    "my/upstream/upstream-module.ts",
    "consumer.ts"
  ]
}
```

# /my/upstream/upstream-module.ts
```ts
import { Directive, NgModule } from '@angular/core';

@Directive({
  selector: '[dirA]',
  standalone: false,
})
class DirectiveA {}

@NgModule({
  declarations: [DirectiveA],
  exports: [DirectiveA],
})
export class UpstreamModule {}
```

# /consumer.ts
```ts
import { Component } from '@angular/core';
import { UpstreamModule } from 'google3/my/upstream/upstream-module';

@Component({
  selector: 'consumer-cmp',
  template: '<div dirA></div>',
  imports: [UpstreamModule],
  standalone: true,
})
export class ConsumerComponent {}
```
