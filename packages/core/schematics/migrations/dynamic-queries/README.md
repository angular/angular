## Dynamic queries migration

Automatically migrates dynamic queries to remove their `static` flag. This flag will no
longer be necessary in version 9 for dynamic queries, as `false` is the default value.

#### Before
```ts
import { Directive, ViewChild, ContentChild, ElementRef } from '@angular/core';

@Directive()
export class MyDirective {
  @ViewChild('child', { static: false }) child: any;
  @ViewChild('secondChild', { read: ElementRef, static: false }) secondChild: ElementRef;
  @ContentChild('thirdChild', { static: false }) thirdChild: any;
}
```

#### After
```ts
import { Directive, ViewChild, ContentChild, ElementRef } from '@angular/core';

@Directive()
export class MyDirective {
  @ViewChild('child') child: any;
  @ViewChild('secondChild', { read: ElementRef }) secondChild: ElementRef;
  @ContentChild('thirdChild') thirdChild: any;
}
```
