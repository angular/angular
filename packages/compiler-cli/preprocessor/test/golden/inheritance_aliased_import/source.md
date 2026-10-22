# /tsconfig.json
```json
{
  "compilerOptions": {
    "strict": true,
    "skipLibCheck": true,
    "moduleResolution": "node",
    "target": "es2022",
    "module": "es2022",
    "lib": ["es2022", "dom"]
  },
  "files": ["base.ts", "child.ts", "widget.ts", "app.ts"]
}
```

# /base.ts
```ts
import { Directive, EventEmitter, Input, Output } from '@angular/core';

@Directive()
export class BaseDirective {
  @Input() value = '';
  @Output() readonly valueChange = new EventEmitter<string>();
}
```

# /child.ts
```ts
import { Component, EventEmitter, Output } from '@angular/core';
import { BaseDirective as AliasedBase } from './base';

@Component({
  selector: 'child-comp',
  template: '',
})
export class ChildComponent extends AliasedBase {
  @Output() readonly selected = new EventEmitter<number>();
}
```

# /node_modules/some-lib/package.json
```json
{
  "name": "some-lib",
  "types": "index.d.ts"
}
```

# /node_modules/some-lib/index.d.ts
```ts
import * as i0 from '@angular/core';

export declare class Widget {
  items: string[];
  itemsSubmit: i0.EventEmitter<string[]>;
  static ɵfac: i0.ɵɵFactoryDeclaration<Widget, never>;
  static ɵdir: i0.ɵɵDirectiveDeclaration<Widget, never, never, { "items": { "alias": "items"; "required": false; }; }, { "itemsSubmit": "itemsSubmit"; }, never, never, true, never>;
}
```

# /widget.ts
```ts
import { Component } from '@angular/core';
import { Widget as BaseWidget } from 'some-lib';

@Component({
  selector: 'app-widget',
  template: '',
})
export class Widget extends BaseWidget {}
```

# /app.ts
```ts
import { Component } from '@angular/core';
import { ChildComponent } from './child';
import { Widget } from './widget';

@Component({
  selector: 'app-root',
  template: `
    <child-comp
      [value]="currentValue"
      (valueChange)="onValueChange($event)"
      (selected)="onSelected($event)"
    ></child-comp>
    <app-widget
      [items]="currentItems"
      (itemsSubmit)="onItemsSubmit($event)"
    ></app-widget>
  `,
  imports: [ChildComponent, Widget],
})
export class AppComponent {
  currentValue = '';
  currentItems: string[] = [];
  onValueChange(value: string) {}
  onSelected(index: number) {}
  onItemsSubmit(items: string[]) {}
}
```
