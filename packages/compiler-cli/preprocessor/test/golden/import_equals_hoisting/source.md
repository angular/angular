# /tsconfig.json
```json
{
  "compilerOptions": {
    "strict": true,
    "target": "es2022",
    "module": "commonjs",
    "moduleResolution": "node"
  },
  "files": ["ns.ts", "x.ts", "cmp.ts", "jit.ts", "plain.ts"]
}
```

# /ns.ts
```ts
export namespace formTypes {
  export enum LabelStyleEnum {
    A,
    B,
  }
}

export const c = 1;
```

# /x.ts
```ts
export const x = 1;
```

# /cmp.ts
```ts
import {Component} from '@angular/core';
import {formTypes} from './ns';

const k = 1;
import B = formTypes.LabelStyleEnum;
import {c} from './ns';
import req = require('./x');

@Component({selector: 'app-cmp', template: ''})
export class AppCmp {
  values = [k, B.A, c, req.x];
}

export import LabelStyleEnum = formTypes.LabelStyleEnum;
```

# /jit.ts
```ts
import {Component} from '@angular/core';
import {formTypes} from './ns';

export const k = 1;
import {c} from './ns';

@Component({selector: 'jit-cmp', template: '', jit: true})
export class JitCmp {
  value = c;
}

export import JitLabel = formTypes.LabelStyleEnum;
```

# /plain.ts
```ts
import {formTypes} from './ns';

export const value = 1;

export import PlainLabel = formTypes.LabelStyleEnum;
```
