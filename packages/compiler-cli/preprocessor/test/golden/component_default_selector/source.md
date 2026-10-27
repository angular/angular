# /tsconfig.json
```json
{
  "compilerOptions": {
    "strict": true
  },
  "files": ["standalone.ts", "module.ts"]
}
```

# /standalone.ts
```ts
import { Component } from '@angular/core';

// No `selector`: ngtsc gives a component the default selector `ng-component`.
@Component({
  template: '<span>child</span>',
})
export class Child {}

// An empty `selector` also falls back to `ng-component` for a component.
@Component({
  selector: '',
  template: '<b>empty</b>',
})
export class EmptySelector {}

@Component({
  selector: 'app-root',
  imports: [Child],
  template: '<ng-component></ng-component>',
})
export class App {}

@Component({
  selector: 'app-empty',
  imports: [EmptySelector],
  template: '<ng-component></ng-component>',
})
export class AppEmpty {}

// The class name is not a selector: `<Child>` matches nothing and is an unknown element.
@Component({
  selector: 'app-by-name',
  imports: [Child],
  template: '<Child></Child>',
})
export class AppByName {}
```

# /module.ts
```ts
import { Component, NgModule } from '@angular/core';

@Component({
  standalone: false,
  template: '<i>module child</i>',
})
export class ModuleChild {}

@Component({
  selector: 'module-parent',
  standalone: false,
  template: '<ng-component></ng-component>',
})
export class ModuleParent {}

@NgModule({
  declarations: [ModuleChild, ModuleParent],
})
export class ChildModule {}
```
