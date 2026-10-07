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

export declare class MyDtsDirective {
  myProp: string;
  static ɵfac: i0.ɵɵFactoryDeclaration<MyDtsDirective, never>;
  // standalone: true
  static ɵdir: i0.ɵɵDirectiveDeclaration<MyDtsDirective, "[my-dir]", ["myDir1", "myDir2"], {"myProp": { "alias": "myProp"; "required": false; }; }, {}, never, never, true>;
}

export declare class MyDtsComponent {
  myProp: string;
  static ɵfac: i0.ɵɵFactoryDeclaration<MyDtsComponent, never>;
  // standalone: true
  static ɵcmp: i0.ɵɵComponentDeclaration<MyDtsComponent, "my-cmp", ["myCmp"], {"myProp": { "alias": "myProp"; "required": false; }; }, {}, never, never, true>;
}
```

# /app.ts
```ts
import {Component} from '@angular/core';
import {MyDtsDirective, MyDtsComponent} from './my-dir';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [MyDtsDirective, MyDtsComponent],
  template: `
    <div my-dir #ref1="myDir1" [myProp]="'test'"></div>
    <my-cmp #ref2="myCmp" [myProp]="'test'"></my-cmp>
    {{ref1.myProp}} - {{ref2.myProp}}
  `
})
export class AppComponent {}
```
