import {Component, NgModule} from '@angular/core';

@Component({
    template: `
  <span>Safe Property with Calls: {{ p()?.a()?.b()?.c()?.d() }}</span>
  <span>Safe and Unsafe Property with Calls: {{ p?.a()?.b().c().d()?.e()?.f?.g.h?.i()?.j()?.k().l }}</span>
  <span>Nested Safe with Calls: {{ f1()?.[f2()?.a]?.b }}</span>
  <span>Deep Nested Safe with Calls: {{ f1()?.[f2()?.f3()?.[f4()?.f5()]]?.f6() }}</span>
`,
    standalone: false
})
export class MyApp {
  p: any = null;
  f1(): any {}
  f2(): any {}
  f3(): any {}
  f4(): any {}
  f5(): any {}
  f6(): any {}
}

@NgModule({declarations: [MyApp]})
export class MyModule {
}
