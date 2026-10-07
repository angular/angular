# /tsconfig.json
```json
{
  "compilerOptions": {
    "strict": true,
    "skipLibCheck": true,
    "moduleResolution": "node",
    "target": "es2022",
    "lib": ["es2022", "dom"]
  },
  "files": ["app.component.ts"]
}
```

# /node_modules/external-lib/package.json
```json
{
  "name": "external-lib",
  "types": "index.d.ts"
}
```

# /node_modules/external-lib/index.d.ts
```ts
import * as i0 from "@angular/core";

export declare abstract class BaseSetting<T> {
  static ɵdir: i0.ɵɵDirectiveDeclaration<
    BaseSetting<any>,
    never,
    never,
    { "value": { "alias": "value"; "required": true; "isSignal": true; }; },
    { "value": "valueChange"; },
    never,
    never,
    true,
    never
  >;
}
```

# /base.directive.ts
```ts
import { Directive, model } from '@angular/core';

@Directive({
  selector: '[baseDir]',
  standalone: true,
})
export class BaseDir {
  counter = model(0);
}
```

# /child.component.ts
```ts
import { Component } from '@angular/core';
import { BaseDir } from './base.directive';
import { BaseSetting } from 'external-lib';

@Component({
  selector: 'child-cmp',
  template: '<span>Child</span>',
  standalone: true,
})
export class ChildComponent extends BaseDir {}

@Component({
  selector: 'setting-cmp',
  template: '<span>Setting</span>',
  standalone: true,
})
export class SettingComponent extends BaseSetting<string> {}
```

# /app.component.ts
```ts
import { Component } from '@angular/core';
import { ChildComponent, SettingComponent } from './child.component';

@Component({
  selector: 'app-root',
  template: `
    <child-cmp [(counter)]="myCount" />
    <setting-cmp [(value)]="myValue" />
  `,
  standalone: true,
  imports: [ChildComponent, SettingComponent],
})
export class AppComponent {
  myCount = 1;
  myValue = 'hello';
}
```
