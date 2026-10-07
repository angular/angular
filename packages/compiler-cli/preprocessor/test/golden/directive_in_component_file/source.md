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
import { Component, Directive, Input } from '@angular/core';

@Directive({
  selector: '[localDir]',
  standalone: true,
})
export class LocalDir {
  @Input() localDir: string = '';
}

@Component({
  selector: 'app-root',
  template: '<div [localDir]="message"></div>',
  standalone: true,
  imports: [LocalDir],
})
export class AppComponent {
  message = 'hello';
}
```
