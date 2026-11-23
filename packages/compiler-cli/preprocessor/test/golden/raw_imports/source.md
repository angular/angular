# /tsconfig.json
```json
{
  "compilerOptions": {
    "strict": true
  },
  "files": ["router.ts", "app.component.ts"]
}
```

# /router.ts
```ts
import { NgModule, Directive } from '@angular/core';

@Directive({
  selector: '[routerLink]',
  standalone: false,
})
export class RouterLink {}

@NgModule({
  declarations: [RouterLink],
  exports: [RouterLink],
})
export class RouterModule {
  static forRoot(routes: any[]) {
    return {
      ngModule: RouterModule,
      providers: []
    };
  }
}
```

# /app.component.ts
```ts
import { Component, NgModule } from '@angular/core';
import { RouterModule } from './router';

@Component({
  selector: 'app-root',
  template: `<a routerLink="/">Home</a>`,
  standalone: false,
})
export class AppComponent {}

@NgModule({
  imports: [RouterModule.forRoot([])],
  declarations: [AppComponent],
})
export class AppModule {}
```
