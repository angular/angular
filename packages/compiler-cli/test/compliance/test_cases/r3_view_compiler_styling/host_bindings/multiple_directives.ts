import {Component, Directive, HostBinding, NgModule} from '@angular/core';

@Directive({
    selector: '[myClassDir]',
    standalone: false
})
export class ClassDirective {
  @HostBinding('class') myClassMap = {red: true};
}

@Directive({
    selector: '[myWidthDir]',
    standalone: false
})
export class WidthDirective {
  @HostBinding('style.width') myWidth = 200;

  @HostBinding('class.foo') myFooClass = true;
}

@Directive({
    selector: '[myHeightDir]',
    standalone: false
})
export class HeightDirective {
  @HostBinding('style.height') myHeight = 200;

  @HostBinding('class.bar') myBarClass = true;
}

@Component({
    selector: 'my-component',
    template: '<div myWidthDir myHeightDir myClassDir></div>',
    standalone: false
})
export class MyComponent {
}

@NgModule({declarations: [MyComponent, WidthDirective, HeightDirective, ClassDirective]})
export class MyModule {
}
