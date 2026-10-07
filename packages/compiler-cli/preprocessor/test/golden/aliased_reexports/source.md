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
    "my/upstream/directive.ts",
    "my/upstream/upstream-module.ts",
    "consumer.ts"
  ]
}
```

# /my/upstream/directive.ts
```ts
import { Directive } from '@angular/core';

@Directive({
  selector: '[dirA]',
  standalone: false,
})
export class DirectiveA {}
```

# /my/upstream/upstream-module.ts
```ts
import { NgModule } from '@angular/core';
import { DirectiveA } from './directive';

@NgModule({
  declarations: [DirectiveA],
  exports: [DirectiveA],
})
export class UpstreamModule {}

export { DirectiveA as ɵɵDirectiveA } from './directive';
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


