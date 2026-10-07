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

# /node_modules/material-lib/package.json
```json
{
  "name": "material-lib",
  "types": "index.d.ts"
}
```

# /node_modules/material-lib/index.d.ts
```ts
import * as i0 from "@angular/core";

export declare class _MatButtonMixinBase {}

export declare class MatButton extends _MatButtonMixinBase {
  disableRipple: boolean;
  static ɵcmp: i0.ɵɵComponentDeclaration<
    MatButton,
    "button[mat-button]",
    never,
    {
      disabled: "disabled";
      color: "color";
      disableRipple: "disableRipple";
    },
    {},
    never,
    never,
    true,
    never
  >;
}
```

# /app.component.ts
```ts
import { Component } from '@angular/core';
import { MatButton } from 'material-lib';

@Component({
  selector: 'app-root',
  template: `
    <button mat-button [disabled]="true" [color]="'primary'" [disableRipple]="false">Click</button>
  `,
  standalone: true,
  imports: [MatButton],
})
export class AppComponent {}
```
