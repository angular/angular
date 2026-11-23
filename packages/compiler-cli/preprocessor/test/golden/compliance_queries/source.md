# /tsconfig.json
```json
{
  "compilerOptions": {
    "strict": true,
    "target": "es2022",
    "module": "es2022",
    "moduleResolution": "node"
  },
  "files": ["static_view_query.ts", "some.directive.ts"]
}
```

# /some.directive.ts
```ts
import {Directive} from '@angular/core';

@Directive({
    selector: '[someDir]',
    standalone: false
})
export class SomeDirective {
}
```

# /static_view_query.ts
```ts
import {Component, ElementRef, NgModule, ViewChild} from '@angular/core';

import {SomeDirective} from './some.directive';

@Component({
    selector: 'view-query-component',
    template: `
    <div someDir></div>
  `,
    standalone: false
})
export class ViewQueryComponent {
  @ViewChild(SomeDirective, {static: true}) someDir!: SomeDirective;
  @ViewChild('foo') foo!: ElementRef;
}

@NgModule({declarations: [SomeDirective, ViewQueryComponent]})
export class MyModule {
}
```
