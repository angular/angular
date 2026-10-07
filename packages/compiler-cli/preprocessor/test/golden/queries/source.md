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
import { Component, ViewChild, ViewChildren, ContentChild, ContentChildren, viewChild, viewChildren, contentChild, contentChildren, ElementRef, TemplateRef, QueryList, forwardRef } from '@angular/core';
import * as core from '@angular/core';

@Component({
  selector: 'app-root',
  template: '<div><slot></slot></div>',
  standalone: true,
})
export class AppComponent {
  // Decorator queries
  @ViewChild('myDiv') div!: ElementRef;
  @ViewChild('myTpl', { read: TemplateRef, static: true }) tpl!: TemplateRef<any>;
  
  @ViewChildren('item', { emitDistinctChangesOnly: false }) items!: QueryList<ElementRef>;
  
  @ContentChild('content', { descendants: true }) content!: ElementRef;
  
  @ContentChildren('contentItem', { descendants: false, emitDistinctChangesOnly: true }) contentItems!: QueryList<ElementRef>;

  @ViewChild(forwardRef(() => SomeComponent)) forwardComponent!: SomeComponent;
  @ContentChild(SomeModule.SomeDirective, { read: core.TemplateRef }) complexComponent!: any;

  @ViewChild('setterQuery') set setterQuery(val: ElementRef) {}

  // Signal queries
  signalDiv = viewChild<ElementRef>('myDiv');
  signalTpl = viewChild('myTpl', { read: TemplateRef });
  signalItems = viewChildren<ElementRef>('item');
  reqSignalDiv = viewChild.required<ElementRef>('myDiv');
  
  signalContent = contentChild<ElementRef>('content', { descendants: true });
  signalContentItems = contentChildren<ElementRef>('contentItem', { descendants: false });

  namespacedView = core.viewChild('nsView');
  namespacedReqView = core.viewChild.required('nsReqView');
}
```
