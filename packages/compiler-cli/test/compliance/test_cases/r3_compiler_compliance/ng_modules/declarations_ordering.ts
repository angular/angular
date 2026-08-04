import {Component, Directive, NgModule} from '@angular/core';

@Directive({
  selector: '[dir]',
  standalone: false,
})
export class DirectiveA {}

@Component({
  selector: 'comp-a',
  template: '...',
  standalone: false,
})
export class ComponentA {}

@NgModule({
  declarations: [DirectiveA, ComponentA],
  exports: [DirectiveA, ComponentA],
})
export class ModuleA {}

@Directive({
  selector: '[dir]',
  standalone: false,
})
export class DirectiveB {}

@Component({
  selector: 'comp-b',
  template: '...',
  standalone: false,
})
export class ComponentB {}

@Component({
  selector: 'app',
  template: `
    <div dir></div>
    <comp-a></comp-a>
    <comp-b></comp-b>
  `,
  standalone: false,
})
export class App {}

@NgModule({
  imports: [ModuleA],
  declarations: [DirectiveB, ComponentB, App],
})
export class ModuleB {}
