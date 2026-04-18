import {Component, NgModule} from '@angular/core';

// Two safe navigation chains in separate instructions. Their temporary
// variables have non-overlapping lifetimes, so the optimizer should
// assign both to the same slot (tmp_0) instead of tmp_0_0 and tmp_1_0.
@Component({
    template: `
  <span>{{ a()?.b }}</span>
  <span>{{ c()?.d }}</span>
`,
    standalone: false
})
export class MyApp {
  a(): any { return null; }
  c(): any { return null; }
}

@NgModule({declarations: [MyApp]})
export class MyModule {}
