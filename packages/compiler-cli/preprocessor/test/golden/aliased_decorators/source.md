# /tsconfig.json
```json
{
  "compilerOptions": {
    "strict": true
  },
  "files": [
    "service.ts",
    "injectable.ts",
    "directive.ts",
    "pipe.ts",
    "component.ts",
    "ngmodule.ts",
    "namespaced.ts"
  ]
}
```

# /service.ts
```ts
import { Service as AngularService, Injectable } from '@angular/core';

@AngularService()
export class ParentService {
  getData(): string {
    return 'hello';
  }
}

@Injectable()
export class ChildService extends ParentService {}
```

# /injectable.ts
```ts
import {
  Injectable as AngularInjectable,
  Inject as AngularInject,
  Optional as AngularOptional,
  InjectionToken,
} from '@angular/core';

export const DEP_TOKEN = new InjectionToken<string>('DEP_TOKEN');

@AngularInjectable()
export class MyInjectable {
  constructor(@AngularOptional() @AngularInject(DEP_TOKEN) public dep: any) {}
}
```

# /directive.ts
```ts
import {
  Directive as AngularDirective,
  Input as AngularInput,
  Output as AngularOutput,
  HostBinding as AngularHostBinding,
  HostListener as AngularHostListener,
  EventEmitter,
} from '@angular/core';

@AngularDirective({
  selector: '[myDir]',
  standalone: true,
  inputs: ['declaredInput: dirInput'],
  outputs: ['declaredOutput: dirOutput'],
})
export class MyDirective {
  @AngularInput() boundInput: string = '';
  @AngularOutput() boundOutput = new EventEmitter<void>();
  @AngularHostBinding('class.active') isActive = true;
  @AngularHostListener('click', ['$event'])
  onClick(e: any) {}
}
```

# /pipe.ts
```ts
import { Pipe as AngularPipe } from '@angular/core';

@AngularPipe({
  name: 'myPipe',
  standalone: true,
})
export class MyPipe {}
```

# /component.ts
```ts
import {
  Component as AngularComponent,
  Inject as AngularInject,
  Optional as AngularOptional,
  Self as AngularSelf,
  InjectionToken,
} from '@angular/core';
import { MyDirective } from './directive';
import { MyPipe } from './pipe';

export const MY_TOKEN = new InjectionToken<string>('MY_TOKEN');

@AngularComponent({
  selector: 'my-comp',
  standalone: true,
  imports: [MyDirective, MyPipe],
  template: '<div myDir>{{ "test" | myPipe }}</div>',
})
export class MyComponent {
  constructor(
    @AngularInject(MY_TOKEN) @AngularOptional() @AngularSelf() public service: any,
  ) {}
}
```

# /ngmodule.ts
```ts
import { NgModule as AngularNgModule } from '@angular/core';

@AngularNgModule({})
export class MyNgModule {}
```

# /namespaced.ts
```ts
import * as core from '@angular/core';

export const NAMESPACED_TOKEN = new core.InjectionToken<string>('NAMESPACED_TOKEN');

@core.Injectable()
export class NamespacedService {
  constructor(@core.Inject(NAMESPACED_TOKEN) @core.Optional() public dep: any) {}
}

@core.Directive({
  selector: '[namespacedDir]',
  standalone: true,
})
export class NamespacedDirective {
  @core.Input() prop: string = '';
  @core.Output() done = new core.EventEmitter<void>();
  @core.HostBinding('attr.role') role = 'button';
  @core.HostListener('focus')
  onFocus() {}
}
```
