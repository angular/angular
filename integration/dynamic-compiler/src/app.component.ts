import {AfterViewInit, Compiler, Component, ViewChild, ViewContainerRef} from '@angular/core';

declare var System: any;

@Component({
  selector: 'app-root',
  template: `
    <h1>Hello world!</h1>
    <div #vc></div>
  `,
})
export class AppComponent implements AfterViewInit {
  @ViewChild('vc', {read: ViewContainerRef}) container: ViewContainerRef;

  constructor(private compiler: Compiler) {}

  ngAfterViewInit() {
    System.import('./dist/lazy.bundle.js').then((module: any) => {
      this.compiler.compileModuleAndAllComponentsAsync(module.LazyModule).then((compiled) => {
        const factory = compiled.componentFactories[0];
        this.container.createComponent(factory);
      });
    });
  }
}
