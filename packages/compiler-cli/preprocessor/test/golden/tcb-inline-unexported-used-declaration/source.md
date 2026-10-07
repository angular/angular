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
import { Component, Pipe, PipeTransform } from '@angular/core';

@Pipe({
  name: 'localPipe',
  standalone: true
})
class LocalPipe implements PipeTransform {
  transform(value: string): string { return value; }
}

@Component({
  selector: 'app-root',
  template: '<div>{{ "hello" | localPipe }}</div>',
  standalone: true,
  imports: [LocalPipe]
})
export class AppComponent {}
```
