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
import { Component, Directive, InjectionToken } from '@angular/core';

export class BaseComponent {
  protected static BASE_TOKEN = new InjectionToken<string>('BASE_TOKEN');
  protected static getBaseConfig() {
    return { provide: BaseComponent.BASE_TOKEN, useValue: 'base-val' };
  }
}

@Component({
  selector: 'app-protected',
  template: '<div>{{ value }}</div>',
  standalone: true,
  providers: [
    ProtectedComponent.getProtectedProvider(),
    BaseComponent.getBaseConfig(),
  ],
})
export class ProtectedComponent extends BaseComponent {
  protected static PROTECTED_TOKEN = new InjectionToken<string>('PROTECTED_TOKEN');

  protected static getProtectedProvider() {
    return { provide: ProtectedComponent.PROTECTED_TOKEN, useValue: 'protected-val' };
  }

  value = 'test';
}

@Directive({
  selector: '[appProtectedDir]',
  standalone: true,
  providers: [ProtectedDirective.getDirectiveProvider()],
})
export class ProtectedDirective {
  protected static DIR_TOKEN = new InjectionToken<string>('DIR_TOKEN');

  protected static getDirectiveProvider() {
    return { provide: ProtectedDirective.DIR_TOKEN, useValue: 'dir-val' };
  }
}
```
