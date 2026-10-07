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
import { Component, Directive, Pipe, PipeTransform, NgModule } from '@angular/core';

@Directive({
  selector: '[localDir]',
  standalone: false,
})
export class LocalDir {}

@Pipe({
  name: 'localPipe',
  standalone: false,
})
export class LocalPipe implements PipeTransform {
  transform(value: any) { return value; }
}

@Component({
  selector: 'local-comp',
  template: '<div>local</div>',
  standalone: false,
})
export class LocalComp {}

@Component({
  selector: 'app-root',
  template: '<local-comp localDir>{{ "test" | localPipe }}</local-comp>',
  standalone: false,
})
export class AppComponent {}

@NgModule({
  declarations: [LocalDir, LocalPipe, LocalComp, AppComponent],
})
export class AppModule {}
```
