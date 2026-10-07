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

# /feature-component.d.ts
```ts
import * as i0 from '@angular/core';
export declare class MyFeatureComponent {
  myProp: string;
  static ɵfac: i0.ɵɵFactoryDeclaration<MyFeatureComponent, never>;
  static ɵcmp: i0.ɵɵComponentDeclaration<MyFeatureComponent, "feature-cmp", never, {"myProp": { "alias": "myProp"; "required": false; }; }, {}, never, never, false, never>;
}
```

# /feature-module.d.ts
```ts
import * as i0 from '@angular/core';
import * as i1 from './feature-component';
export declare class MyFeatureModule {
  static ɵfac: i0.ɵɵFactoryDeclaration<MyFeatureModule, never>;
  static ɵmod: i0.ɵɵNgModuleDeclaration<MyFeatureModule, never, never, [typeof i1.MyFeatureComponent]>;
}
```

# /app.ts
```ts
import {Component} from '@angular/core';
import {MyFeatureModule} from './feature-module';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [MyFeatureModule],
  template: `
    <feature-cmp [myProp]="'hello'"></feature-cmp>
  `
})
export class AppComponent {}
```
