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
import { Component, Directive, Injectable, Pipe, PipeTransform, Service, NgModule } from '@angular/core';

@Component({
  selector: 'meta-comp',
  template: '<div>Metadata</div>',
  standalone: true,
})
export class MetaComponent {}

@Directive({
  selector: '[metaDir]',
  standalone: true,
})
export class MetaDirective {}

@Injectable({
  providedIn: 'root',
})
export class MetaService {}

@Pipe({
  name: 'metaPipe',
  pure: true,
  standalone: true,
})
export class MetaPipe implements PipeTransform {
  transform(value: any) {
    return value;
  }
}

@Service()
export class NoArgDecorator {}

@Component({
  selector: 'multi-meta',
  template: '<div>Multi</div>',
  standalone: true,
})
@Injectable()
export class MultiMetaComponent {}

@NgModule({
  declarations: [MetaDirective],
  exports: [MetaDirective],
  id: 'MetaNgModuleId',
})
export class MetaNgModule {}
```
