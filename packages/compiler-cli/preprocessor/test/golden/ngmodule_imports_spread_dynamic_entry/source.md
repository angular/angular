# /tsconfig.json
```json
{
  "compilerOptions": {
    "strictTemplates": true
  },
  "files": ["/globals.d.ts", "/test.ts"]
}
```

# /globals.d.ts
```ts
declare const PRODUCTION: boolean;
```

# /router.ts
```ts
import {Component, NgModule} from '@angular/core';

@Component({
  selector: 'router-outlet',
  standalone: false,
  template: '',
})
export class RouterOutlet {}

@NgModule({
  declarations: [RouterOutlet],
  exports: [RouterOutlet],
})
export class RouterModule {}
```

# /test.ts
```ts
import {Component, NgModule} from '@angular/core';
import {RouterModule} from './router';

@NgModule({})
export class DevToolsModule {
  static instrument() {
    return {ngModule: DevToolsModule};
  }
}

const extraModules = [
  PRODUCTION ? [] : DevToolsModule.instrument(),
];

@Component({
  selector: 'app-root',
  standalone: false,
  template: `<router-outlet></router-outlet>`,
})
export class AppComponent {}

@NgModule({
  declarations: [AppComponent],
  imports: [
    RouterModule,
    ...extraModules,
  ],
})
export class AppModule {}
```
