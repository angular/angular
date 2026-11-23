# /tsconfig.json
```json
{
  "compilerOptions": {
    "strict": true
  },
  "files": ["app.component.ts"]
}
```

# /app.component.ts
```ts
import { Component } from '@angular/core';

@Component({
  selector: 'test',
  template: 'Main: <ng-content/> Slot: <ng-content select="[foo]"/>',
})
export class TestComponent {}

@Component({
  selector: 'app-root',
  imports: [TestComponent],
  template: `<test>Before @for (item of items; track $index) { <span foo>{{ item }}</span> } After</test>`,
})
export class AppComponent {
  items = [1, 2, 3];
}
```
