import {NgModule, NO_ERRORS_SCHEMA, forwardRef, Component, Directive} from '@angular/core';

@Directive({
  selector: '[my-decl]',
  standalone: false
})
export class MyDecl {}

@NgModule({})
export class MyImport {}

@Directive({
  selector: '[my-export]',
  standalone: false
})
export class MyExport {}

@Component({
  selector: 'my-bootstrap',
  template: '',
  standalone: false
})
export class MyBootstrap {}

@NgModule({
  declarations: [MyDecl, MyExport],
  imports: [MyImport],
  exports: [MyExport],
  bootstrap: [forwardRef(() => MyBootstrap)],
  schemas: [NO_ERRORS_SCHEMA],
  id: 'my-module-id'
})
export class MyModule {}
