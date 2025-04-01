import {Component, NgModule} from '@angular/core';

@Component({
    template: `
  <span>Safe Property: {{ p?.a?.b?.c?.d }}</span>
  <span>Safe Keyed: {{ p?.['a']?.['b']?.['c']?.['d'] }}</span>
  <span>Mixed Property: {{ p?.a?.b.c.d?.e?.f?.g.h }}</span>
  <span>Mixed Property and Keyed: {{ p.a['b'].c.d?.['e']?.['f']?.g['h']['i']?.j.k }}</span>
`,
    standalone: false
})
export class MyApp {
  p: any = null;
}

@NgModule({declarations: [MyApp]})
export class MyModule {
}
