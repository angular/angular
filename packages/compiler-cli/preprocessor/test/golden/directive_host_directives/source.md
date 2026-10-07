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
import { Component, Directive, Input, Output, EventEmitter } from '@angular/core';

@Directive({
    selector: '[myDir]',
    standalone: true
})
export class MyDir {
    @Input() myDirInput: string = '';
    @Output() myDirOutput = new EventEmitter<string>();
}

@Directive({
    selector: '[myOtherDir]',
    standalone: true
})
export class MyOtherDir {
    @Input() myOtherDirInput: string = '';
}

@Component({
    selector: 'my-comp',
    standalone: true,
    template: '<div>Hello</div>',
    hostDirectives: [
        {
            directive: MyDir,
            inputs: ['myDirInput: myDirInputAlias'],
            outputs: ['myDirOutput: myDirOutputAlias']
        },
        MyOtherDir
    ]
})
export class MyComp {}
```
