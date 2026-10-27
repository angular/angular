# /tsconfig.json
```json
{
  "compilerOptions": {
    "strict": true
  },
  "angularCompilerOptions": {
    "compileNonExportedClasses": false
  },
  "files": ["test.ts"]
}
```

# /test.ts
```ts
import { Component, Directive, Injectable } from '@angular/core';

@Injectable()
class LocalService {}

@Directive({ selector: '[local]', standalone: false })
class LocalDir {}

@Component({ selector: 'standalone-local', template: '<span>hi</span>' })
class StandaloneLocal {}

@Directive({ selector: '[exported]', standalone: false })
export class ExportedDir {}
```
