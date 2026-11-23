# /tsconfig.json
```json
{
  "compilerOptions": {
    "strict": true
  },
  "files": ["helper.ts", "app.ts"]
}
```

# /helper.ts
```ts
export const SETUP = 1;
import {Injectable} from '@angular/core';
export const USED = Injectable;
```

# /app.ts
```ts
import {Component} from '@angular/core';
export namespace MyNs {
  export const VAL = 42;
}
import AliasVal = MyNs.VAL;

@Component({
  selector: 'app-comp',
  template: '',
})
export class AppComp {
  val = AliasVal;
}
```
