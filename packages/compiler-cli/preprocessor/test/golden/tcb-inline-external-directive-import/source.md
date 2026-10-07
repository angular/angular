# /tsconfig.json
```json
{
  "compilerOptions": {
    "strict": true
  },
  "files": ["app.component.ts", "external.directive.ts"]
}
```

# /external.directive.ts
```ts
import { Directive, Input } from '@angular/core';

@Directive({
  selector: '[extDir]',
  standalone: true
})
export class ExternalDir {
  @Input() extDir: string = '';
}
```

# /app.component.ts
```ts
import { Component, Directive, Input } from '@angular/core';
import { ExternalDir } from './external.directive';

@Directive({
  selector: '[localDir]',
  standalone: true
})
class LocalDir {
  @Input() localDir: string = '';
}

@Component({
  selector: 'app-root',
  template: '<div [localDir]="message" [extDir]="message"></div>',
  standalone: true,
  imports: [LocalDir, ExternalDir]
})
export class AppComponent {
  message = 'hello';
}
```
