# /tsconfig.json
```json
{
  "compilerOptions": {
    "strict": true
  },
  "files": ["app.component.ts", "app.exported-later.ts"]
}
```

# /app.component.ts
```ts
import { Component, Pipe, PipeTransform } from '@angular/core';

@Pipe({
  name: 'myPipe',
  standalone: true
})
export class MyPipe implements PipeTransform {
  transform(value: string): string { return value; }
}

@Component({
  selector: 'app-root',
  template: '<div>{{ "hello" | myPipe }}</div>',
  standalone: true,
  imports: [MyPipe]
})
class AppComponent {}

@Component({
  selector: 'app-root',
  template: '<div>{{ "hello" | myPipe }}</div>',
  standalone: true,
  imports: [MyPipe]
})
export class ExportedAppComponent {}
```

# /app.exported-later.ts
```ts
import { Component, Pipe, PipeTransform } from '@angular/core';

@Pipe({
  name: 'myPipe',
  standalone: true
})
export class MyPipe implements PipeTransform {
  transform(value: string): string { return value; }
}

@Component({
  selector: 'app-root',
  template: '<div>{{ "hello" | myPipe }}</div>',
  standalone: true,
  imports: [MyPipe]
})
class ExportedAppComponent {}

// Not exported above but exported here so we should _not_ end up inlining
export {ExportedAppComponent};
```