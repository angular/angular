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
  standalone: true,
  template: '<div>Selectorless Component</div>',
})
export class SelectorlessComp {
  @Input() heroName: string = '';
  @Output() heroSelect = new EventEmitter<string>();
}

@Directive({
  standalone: true,
})
export class SelectorlessDir {
  @Input() dirInput: string = '';
}

@Component({
  selector: 'app-root',
  standalone: true,
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
