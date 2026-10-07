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

# /my-module.d.ts
```ts
import * as i0 from '@angular/core';

export declare class MyDtsDirective {
  myProp: string;
  static ɵfac: i0.ɵɵFactoryDeclaration<MyDtsDirective, never>;
  static ɵdir: i0.ɵɵDirectiveDeclaration<MyDtsDirective, "[my-dir]", never, {"myProp": { "alias": "myProp"; "required": false; }; }, {}, never, never, false, never>;
}

export declare class MyDtsComponent {
  myProp: string;
  static ɵfac: i0.ɵɵFactoryDeclaration<MyDtsComponent, never>;
  static ɵcmp: i0.ɵɵComponentDeclaration<MyDtsComponent, "my-cmp", never, {"myProp": { "alias": "myProp"; "required": false; }; }, {}, never, never, false, never>;
}

export declare class MyDtsModule {
  static ɵfac: i0.ɵɵFactoryDeclaration<MyDtsModule, never>;
  static ɵmod: i0.ɵɵNgModuleDeclaration<MyDtsModule, [typeof MyDtsDirective, typeof MyDtsComponent], never, [typeof MyDtsDirective, typeof MyDtsComponent]>;
}

export declare class MyNestedModule {
  static ɵfac: i0.ɵɵFactoryDeclaration<MyNestedModule, never>;
  static ɵmod: i0.ɵɵNgModuleDeclaration<MyNestedModule, never, never, [typeof MyDtsModule]>;
}
```

# /app.ts
```ts
import {Component} from '@angular/core';
import {MyNestedModule} from './my-module';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [MyNestedModule],
  template: `
    <div my-dir [myProp]="'test'"></div>
    <my-cmp [myProp]="'test'"></my-cmp>
  `
})
export class AppComponent {}
```
