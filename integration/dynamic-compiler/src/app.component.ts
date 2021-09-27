import {AfterViewInit, Compiler, Component, ViewChild, ViewContainerRef} from '@angular/core';

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
    import('./lazy.module').then(module => {
      this.compiler.compileModuleAndAllComponentsAsync(module.LazyModule).then((compiled) => {
        const factory = compiled.componentFactories[0];
        this.container.createComponent(factory);
      });
    });
  }
}
