# /tsconfig.json
```json
{
  "compilerOptions": {
    "strict": true,
    "target": "es2022",
    "module": "es2022",
    "moduleResolution": "node"
  },
  "files": ["app.ts"]
}
```

# /my-dir.d.ts
```ts
import * as i0 from '@angular/core';

export declare class MyNgIf<T> {
  myNgIf: T;
  static ɵfac: i0.ɵɵFactoryDeclaration<MyNgIf<any>, never>;
  // standalone: true
  static ɵdir: i0.ɵɵDirectiveDeclaration<MyNgIf<any>, "[myNgIf]", never, {"myNgIf": { "alias": "myNgIf"; "required": false; }; }, {}, never, never, true>;
}
```

# /app.ts
```ts
import {Component} from '@angular/core';
import {MyNgIf} from './my-dir';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [MyNgIf],
  template: `
    <div *myNgIf="true"></div>
  `
})
export class AppComponent {}
```
