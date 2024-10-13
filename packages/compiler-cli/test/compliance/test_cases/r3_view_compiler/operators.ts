import {Component, NgModule, Pipe} from '@angular/core';

@Component({
    template: `
    {{ 1 + 2 }}
	{{ (1 % 2) + 3 / 4 * 5 }}
	{{ +1 }}
  {{ typeof {} === 'object' }}
  {{ !(typeof {} === 'object') }}
  {{ typeof foo?.bar === 'string' }}
  {{ typeof foo?.bar | identity }}
`,
    standalone: false
})
export class MyApp {
    foo: {bar?: string} = {bar: 'baz'};
}

@Pipe ({name: 'identity'})
export class IdentityPipe {
    transform(value: any) { return value; }
}

@NgModule({declarations: [MyApp, IdentityPipe]})
export class MyModule {
}
