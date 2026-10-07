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
    "defer_deps.ts",
    "defer_deps_ext.ts"
  ],
  "angularCompilerOptions": {}
}
```

# /defer_deps.ts
```ts
import {Component} from '@angular/core';

import {CmpA} from './defer_deps_ext';

@Component({
  selector: 'local-dep',
  template: 'Local dependency',
})
export class LocalDep {
}

@Component({
  selector: 'test-cmp',
  imports: [CmpA, LocalDep],
  template: `
	@defer {
	<cmp-a />
	<local-dep />
	}
`,
})
export class TestCmp {
}
```

# /defer_deps_ext.ts
```ts
import {Component} from '@angular/core';

@Component({selector: 'cmp-a', template: 'CmpA!'})
export class CmpA {
}
```
