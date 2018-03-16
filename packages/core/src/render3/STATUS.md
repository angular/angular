# Overview

Ivy is a new backwards-compatible Angular renderer focused on further speed improvements, size reduction, and increased flexibility.

Ivy is currently not feature complete, but can be tested via [`enableIvy: true`](https://next.angular.io/guide/aot-compiler#enableivy) [`angularCompilerOptions` flag](https://next.angular.io/guide/aot-compiler#angular-compiler-options).

We currently expect Ivy to remain behind the flag until it's feature complete and battle tested at Google. In the meantime you can check out this [Hello World demo](https://ng-ivy-demo.firebaseapp.com/).

# Implementation Status

## Annotations
| Annotation          | `defineXXX()`                  | Run time | Spec     | Compiler | Back Patch |
| -------------------- | ------------------------------ | ------- | -------- | -------- | -------- |
| `@Component`         | ✅ `defineComponent()`         |    ✅    |  ✅      |  ✅      |  ❌      |
| `@Directive`         | ✅ `defineDirective()`         |    ✅    |  ✅      |  ✅      |  ❌      |
| `@Directive`         | ❌ `defineAbstractDirective()` |    ❌    |  ❌      |  ❌      |  ❌      |
| `@Pipe`              | ✅ `definePipe()`              |    ✅    |  ✅      |  ✅      |  ❌      |
| `@Injectable`        | ✅ `defineInjectable()`        |    ✅    |  ❌      |  ❌      |  ❌      |
| `@NgModule`          | ✅ `defineInjector()`          |    ✅    |  ❌      |  ❌      |  ❌      |
| `@ConfigureInjector` | ❌ `defineInjector()`          |    ❌    |  ❌      |  ❌      |  ❌      |



## Component Composition
| Feature                                  | Runtime | Spec     | Compiler |
| ---------------------------------------- | ------- | -------- | -------- |
| creation reordering based on injection   |   ❌    |    ❌    |    ✅    |
| `class CompA extends CompB {}`           |   ❌    |    ❌    |    ❌    |
| `class CompA extends CompB { @Input }`   |   ❌    |    ❌    |    ❌    |
| `class CompA extends CompB { @Output }`  |   ❌    |    ❌    |    ❌    |



## Life Cycle Hooks
| Feature                   | Runtime | Spec     | Compiler |
| ------------------------- | ------- | -------- | -------- |
| `onChanges()`             |    ✅   |  ✅      |  ✅      |
| `onDestroy()`             |    ✅   |  ✅      |  ✅      |
| `onInit()`                |    ✅   |  ✅      |  ✅      |
| `onChanges()`             |    ✅   |  ✅      |  ✅      |
| `doCheck()`               |    ✅   |  ✅      |  ✅      |
| `afterViewChecked()`      |    ✅   |  ✅      |  ✅      |
| `afterViewInit()`         |    ✅   |  ✅      |  ✅      |
| `afterContentChecked()`   |    ✅   |  ✅      |  ✅      |
| `afterContentInit()`      |    ✅   |  ✅      |  ✅      |
| listener teardown         |    ✅   |  ✅      |  ✅      |



## Template Syntax
| Feature                          | Runtime | Spec     | Compiler |
| -------------------------------- | ------- | -------- | -------- |
| `<div>`                          |  ✅     |  ✅      |  ✅      |
| `<div>{{exp}}</div>`             |  ✅     |  ✅      |  ✅      |
| `<div attr=value>`               |  ✅     |  ✅      |  ✅      |
| `<div (click)="stmt">`           |  ✅     |  ✅      |  ✅      |
| `<div #foo>`                     |  ✅     |  ✅      |  ✅      |
| `<div #foo="bar">`               |  ✅     |  ✅      |  ✅      |
| `<div [value]="exp">`            |  ✅     |  ✅      |  ✅      |
| `<div title="Hello {{name}}!">`  |  ✅     |  ✅      |  ✅      |
| `<div [attr.value]="exp">`       |  ✅     |  ✅      |  ❌      |
| `<div class="literal">`          |  ✅     |  ✅      |  ✅      |
| `<div [class]="exp">`            |  ❌     |  ❌      |  ❌      |
| `<div [class.foo]="exp">`        |  ✅     |  ✅      |  ❌      |
| `<div style="literal">`          |  ✅     |  ✅      |  ✅      |
| `<div [style]="exp">`            |  ❌     |  ❌      |  ❌      |
| `<div [style.foo]="exp">`        |  ✅     |  ✅      |  ❌      |
| `{{ ['literal', exp ] }}`        |  ✅     |  ✅      |  ✅      |
| `{{ { a: 'literal', b: exp } }}` |  ✅     |  ✅      |  ✅      |
| `{{ exp \| pipe: arg }}`         |  ✅     |  ✅      |  ✅      |



## `@Query`
| Feature                         | Runtime | Spec     | Compiler |
| ------------------------------- | ------- | -------- | -------- |
| `@Query(descendants)`           |  ✅     |  ✅      |  n/a      |
| `@Query(one)`                   |  ✅     |  ✅      |  n/a      |
| `@Query(read)`                  |  ✅     |  ✅      |  n/a      |
| `@Query(selector)`              |  ✅     |  ✅      |  n/a      |
| `@Query(Type)`                  |  ✅     |  ✅      |  n/a      |
| `@ContentChildred`              |  ✅     |  ✅      |  ❌       |
| `@ContentChild`                 |  ✅     |  ✅      |  ✅       |
| `@ViewChildren`                 |  ✅     |  ✅      |  ❌       |
| `@ViewChild`                    |  ✅     |  ✅      |  ✅       |



## Content Projection
| Feature                         | Runtime | Spec     | Compiler |
| ------------------------------- | ------- | -------- | -------- |
| `<ng-content>`                  |  ✅     |  ✅      |  ✅      |
| `<ng-content selector="...">`   |  ✅     |  ✅      |  ✅      |
| container `projectAs`           |  ✅     |  ✅      |  ❌      |



## Injection Features
| Feature                             | Runtime | Spec     | Compiler |
| ----------------------------------- | ------- | -------- | -------- |
| `inject(Type)`                      |  ✅     |  ✅      |  ✅      |
| `directiveInject(Type)`             |  ✅     |  ✅      |  ❌      |
| `inject(Type, SkipSelf)`            |  ❌     |  ❌      |  ❌      |
| `attribute('name')`                 |  ✅     |  ✅      |  ❌      |
| `injectChangeDetectionRef()`        |  ✅     |  ✅      |  ❌      |
| `injectElementRef()`                |  ✅     |  ✅      |  ✅      |
| `injectViewContainerRef()`          |  ✅     |  ✅      |  ✅      |
| `injectTemplateRef()`               |  ✅     |  ✅      |  ✅      |
| default `inject()` with no injector |  ❌     |  ❌      |  ❌      |
| sanitization with no injector       |  ✅     |  ✅      |  ❌      |



## Change Detection
| Feature                             | Runtime | 
| ----------------------------------- | ------- | 
| `markDirty()`                       |  ✅     | 
| `detectChanges()`                   |  ✅     | 
| `tick()`                            |  ✅     | 
| `attach()`                          |  ✅     | 
| `detach()`                          |  ✅     | 
| `ON_PUSH`                           |  ✅     | 
| `ALWAYS`                            |  ✅     | 
| `DIRTY`                             |  ✅     | 
| `ATTACHED`                          |  ✅     | 



## Bootstrap API
| Feature                             | Runtime | 
| ----------------------------------- | ------- | 
| `renderComponent()`                 |  ✅     | 
| `getHostElement()`                  |  ✅     | 
| `createInjector()`                  |  ❌     | 



## I18N
| Feature                             | Runtime | Spec     | Compiler |
| ----------------------------------- | ------- | -------- | -------- |
| translate text literals             |  ❌     |  ❌      |  ❌      |
| rearrange text nodes                |  ❌     |  ❌      |  ❌      |
| ICU                                 |  ❌     |  ❌      |  ❌      |





## `______Ref`s
| Method                 | View Container Ref | Template Ref | Embeded View Ref | View Ref | Element Ref | Change Detection Ref |
| ---------------------- | ------------------ | ------------ | ---------------- | -------- | ----------- | -------------------- |
| `clear()`              |  ❌                | n/a          | n/a              | n/a      | n/a         | n/a                  |
| `get()`                |  ❌                | n/a          | n/a              | n/a      | n/a         | n/a                  |
| `createEmbededView()`  |  ✅                | ✅           | n/a              | n/a      | n/a         | n/a                  |
| `createComponent()`    |  ✅                | n/a          | n/a              | n/a      | n/a         | n/a                  |
| `insert()`             |  ✅                | n/a          | n/a              | n/a      | n/a         | n/a                  |
| `move()`               |  ❌                | n/a          | n/a              | n/a      | n/a         | n/a                  |
| `indexOf()`            |  ❌                | n/a          | n/a              | n/a      | n/a         | n/a                  |
| `destroy()`            | n/a                | n/a          |  ❌              | ❌       | n/a         | n/a                  |
| `destroyed`            | n/a                | n/a          |  ❌              | ❌       | n/a         | n/a                  |
| `onDestroy()`          | n/a                | n/a          |  ❌              | ❌       | n/a         | n/a                  |
| `markForCheck()`       | n/a                | n/a          |  ❌              | n/a      | n/a         | ✅                   |
| `detach()`             |  ❌                | n/a          |  ❌              | n/a      | n/a         | ✅                   |
| `detachChanges()`      | n/a                | n/a          |  ❌              | n/a      | n/a         | ✅                   |
| `checkNoChanges()`     | n/a                | n/a          |  ❌              | n/a      | n/a         | ✅                   |
| `reattach()`           | n/a                | n/a          |  ❌              | n/a      | n/a         | ✅                   |
| `nativeElement()`      | n/a                | n/a          | n/a              | n/a      |  ✅         | n/a                  |

## Missing Pieces
- Sanitization ✅
- Back patching in tree shakable way. ❌
- attribute namespace ❌