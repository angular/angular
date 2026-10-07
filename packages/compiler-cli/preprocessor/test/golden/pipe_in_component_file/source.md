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
import { Component, Pipe, PipeTransform } from '@angular/core';

@Pipe({
  name: 'myPipe',
  standalone: true,
})
export class MyPipe implements PipeTransform {
  transform(value: any) { return value + ' filtered'; }
}

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [MyPipe],
  template: '{{ "hello" | myPipe }}',
})
export class AppComponent {}
```
