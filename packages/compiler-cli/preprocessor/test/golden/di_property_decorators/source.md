# /tsconfig.json
```json
{
  "compilerOptions": {
    "strict": true,
    "experimentalDecorators": true
  },
  "files": ["app.ts"]
}
```

# /app.ts
```ts
import {
  Component,
  Directive,
  Host,
  Inject,
  Injectable,
  InjectionToken,
  NgModule,
  Optional,
  Pipe,
  PipeTransform,
  Self,
  SkipSelf,
  inject,
} from '@angular/core';

function CustomProp(): PropertyDecorator {
  return () => {};
}

export const API_URL = new InjectionToken<string>('API_URL');

export class DepService {}

@Injectable({providedIn: 'root'})
export class MyService {
  @Optional()
  private readonly dep = inject(DepService, {optional: true});

  @Host()
  @Self()
  @SkipSelf()
  @Inject(API_URL)
  @CustomProp()
  readonly apiUrl = inject(API_URL);
}

@Component({
  selector: 'app-comp',
  template: '<div></div>',
})
export class MyComponent {
  @Optional()
  readonly dep = inject(DepService, {optional: true});
}

@Directive({
  selector: '[appDir]',
})
export class MyDirective {
  @Optional()
  @Self()
  readonly dep = inject(DepService, {optional: true, self: true});
}

@Pipe({
  name: 'myPipe',
})
export class MyPipe implements PipeTransform {
  @Optional()
  readonly dep = inject(DepService, {optional: true});

  transform(value: string): string {
    return value;
  }
}

@NgModule({})
export class MyModule {
  @Optional()
  readonly dep = inject(DepService, {optional: true});
}
```
