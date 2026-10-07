# /tsconfig.json
```json
{
  "compilerOptions": {
    "strict": true
  },
  "files": [
    "src/app/app.component.ts",
    "src/directives/dir.ts",
    "src/directives/nested/host_dir.ts"
  ]
}
```

# /src/directives/nested/host_dir.ts
```ts
import { Directive, Input, Output, EventEmitter } from '@angular/core';

@Directive({
  standalone: true,
})
export class HostDir {
  @Input() hostInp: string = '';
  @Output() hostOut = new EventEmitter<string>();
}
```

# /src/directives/dir.ts
```ts
import { Directive } from '@angular/core';
import { HostDir } from './nested/host_dir';

@Directive({
  selector: '[myDir]',
  standalone: true,
  hostDirectives: [
    {
      directive: HostDir,
      inputs: ['hostInp: myDirAliasedInp'],
      outputs: ['hostOut: myDirAliasedOut'],
    },
  ],
})
export class MyDir {}
```

# /src/app/app.component.ts
```ts
import { Component } from '@angular/core';
import { MyDir } from '../directives/dir';

@Component({
  selector: 'app-cmp',
  standalone: true,
  imports: [MyDir],
  template: '<div myDir [myDirAliasedInp]="text" (myDirAliasedOut)="onEvent($event)"></div>',
})
export class AppCmp {
  text = 'hello';
  onEvent(val: string) {}
}
```
