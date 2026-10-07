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
    "class_decorators.ts"
  ],
  "angularCompilerOptions": {}
}
```

# /class_decorators.ts
```ts
import {Component, Injectable} from '@angular/core';

import {CustomClassDecorator} from './custom';

@Injectable()
export class BasicInjectable {
}

@Injectable({providedIn: 'root'})
export class RootInjectable {
}

@Injectable()
@CustomClassDecorator()
class CustomInjectable {
}

@Component({
    selector: 'test-cmp',
    templateUrl: 'test_cmp_template.html',
})
export class ComponentWithExternalResource {
}
```

# /test_cmp_template.html
```html
<span>Test template</span>
```
