# /tsconfig.json
```json
{
  "compilerOptions": {
    "strict": true
  },
  "files": [
    "app.component.ts",
    "proto.component.ts",
    "teleport.d.ts",
    "models.ts"
  ]
}
```

# /models.ts
```ts
export enum ProtoFormat {
  JSPB = 0,
  TEXT = 1,
}

export type ProtoFormatType = {
  [ProtoFormat.JSPB]: string;
  [ProtoFormat.TEXT]: string;
};
```

# /proto.component.ts
```ts
import { Component, Input } from "@angular/core";
import { ProtoFormat, ProtoFormatType } from "./models";

@Component({
  selector: "proto-box",
  template: "",
  standalone: true,
})
export class ProtoBox<
  T extends ProtoFormatType[TFormat] = any,
  TFormat extends ProtoFormat = ProtoFormat.JSPB,
> {
  @Input() format!: TFormat;
  @Input() value!: T;
}
```

# /teleport.d.ts
```ts
import * as i0 from "@angular/core";

type PortalComponentType = any;

export declare class FireTeleportalOutlet<C extends PortalComponentType = any, D = any> {
  portal: C;
  static ɵdir: i0.ɵɵDirectiveDeclaration<
    FireTeleportalOutlet<any, any>,
    "[fireTeleportalOutlet]",
    never,
    { "portal": { "alias": "fireTeleportalOutlet"; "required": false } },
    {},
    never,
    never,
    true,
    never
  >;
  static ɵfac: i0.ɵɵFactoryDeclaration<FireTeleportalOutlet<any, any>, never>;
}
```

# /app.component.ts
```ts
import { Component } from "@angular/core";
import { ProtoBox } from "./proto.component";
import { FireTeleportalOutlet } from "./teleport";

@Component({
  selector: "app-root",
  imports: [ProtoBox, FireTeleportalOutlet],
  template: `
    <proto-box [value]="'test'"></proto-box>
    <div [fireTeleportalOutlet]="myPortal"></div>
  `,
  standalone: true,
})
export class AppComponent {
  myPortal: any;
}
```
