# /tsconfig.json
```json
{
  "compilerOptions": {
    "strict": true
  },
  "files": ["test.ts"]
}
```

# /test.ts
```ts
import { Component, NgModule, Pipe, PipeTransform } from '@angular/core';

@Pipe({
  name: 'stateText',
  standalone: false,
})
export class ImportedStateTextPipe implements PipeTransform {
  transform(state?: number): string {
    return 'imported';
  }
}

@NgModule({
  declarations: [ImportedStateTextPipe],
  exports: [ImportedStateTextPipe],
})
export class ImportedSharedModule {}

type Status = 'READY' | 'PENDING' | 'ACTION';

@Pipe({
  name: 'stateText',
  standalone: false,
})
export class LocalStateTextPipe implements PipeTransform {
  transform(state: Status): string {
    return 'local';
  }
}

@Component({
  selector: 'repro-pipe-shadowing',
  standalone: false,
  template: '<div>{{ status | stateText }}</div>',
})
export class ReproPipeShadowingComponent {
  status: Status = 'ACTION';
}

@NgModule({
  declarations: [ReproPipeShadowingComponent, LocalStateTextPipe],
  imports: [ImportedSharedModule],
  exports: [ReproPipeShadowingComponent],
})
export class ReproPipeShadowingModule {}
```
