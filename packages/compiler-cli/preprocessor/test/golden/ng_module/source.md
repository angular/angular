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
import { Component, Directive, NgModule, Input, forwardRef } from '@angular/core';

@Directive({
    selector: '[myDir]',
    standalone: false
})
export class MyDirective {
    @Input() dirInput!: string;
}

@Component({
    selector: 'my-comp',
    template: '<div>{{compInput}}</div>',
    standalone: false
})
export class MyComponent {
    @Input() compInput!: string;
}

@NgModule({
    declarations: [MyDirective, forwardRef(() => MyComponent)],
    exports: [MyDirective, forwardRef(() => MyComponent)],
    id: 'MyModuleId',
    bootstrap: [forwardRef(() => MyComponent)]
})
export class MyModule {}

export class ConfigService {}

@NgModule({})
export class ModuleWithDeps {
    constructor(config: ConfigService) {}
}

@Component({
    selector: 'app-root',
    template: `
        <my-comp [compInput]="'hello'"></my-comp>
        <div myDir [dirInput]="'world'"></div>
    `,
    standalone: true,
    imports: [MyModule]
})
export class AppRoot {
}
```
