# /tsconfig.json
```json
{
  "compilerOptions": {
    "strict": true
  },
  "files": ["app.ts"]
}
```

# /app.ts
```ts
import { Component, Directive, Input, Output, EventEmitter } from '@angular/core';

@Component({
  template: '<div>Selectorless Component</div>',
})
export class SelectorlessComp {
  @Input() heroName: string = '';
  @Output() heroSelect = new EventEmitter<string>();
}

@Directive({
})
export class SelectorlessDir {
  @Input() dirInput: string = '';
}

@Component({
  selector: 'app-root',
  imports: [SelectorlessComp, SelectorlessDir],
  template: `
    <SelectorlessComp [heroName]="hello" (heroSelect)="onSelect($event)"></SelectorlessComp>
    <div @SelectorlessDir(dirInput="hello")></div>
  `,
})
export class AppComponent {
  hello = 'world';
  onSelect(hero: string) {}
}
```
