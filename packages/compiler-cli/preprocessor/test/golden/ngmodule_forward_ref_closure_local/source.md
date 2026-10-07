# /tsconfig.json
```json
{
  "compilerOptions": {
    "strict": true
  },
  "files": ["app.module.ts"]
}
```

# /app.module.ts
```ts
import { Component, NgModule } from '@angular/core';

@NgModule({
  declarations: [MyForwardComponent],
  bootstrap: [MyForwardComponent],
  exports: [MyForwardComponent]
})
export class MyModule {}

@Component({
  selector: 'my-forward',
  template: '<div>Forward</div>',
  standalone: false
})
export class MyForwardComponent {}
```
