# /tsconfig.json
```json
{
  "compilerOptions": {
    "strict": true
  },
  "files": ["dep.ts", "iface.ts", "consumer.ts"]
}
```

# /dep.ts
```ts
export class Dep {}
```

# /iface.ts
```ts
export interface Iface {
  value: string;
}
```

# /consumer.ts
```ts
import {Inject, Injectable, InjectionToken} from '@angular/core';
import {Dep} from './dep';
import {Iface} from './iface';

const depToken = new InjectionToken<Dep>('Dep');
const ifaceToken = new InjectionToken<Dep>('Iface');

@Injectable()
export class Consumer {
  constructor(
    @Inject(depToken) readonly dep: Dep,
    @Inject(ifaceToken) readonly iface: Iface,
  ) {}
}
```
