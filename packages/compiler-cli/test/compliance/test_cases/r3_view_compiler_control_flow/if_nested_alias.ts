import {Component} from '@angular/core';

@Component({
  template: `
    {#if value(); as root}
      Root: {{value()}}/{{root}}
      {#if value(); as inner}
        Inner: {{value()}}/{{root}}/{{inner}}
        {#if value(); as innermost}
          Innermost: {{value()}}/{{root}}/{{inner}}/{{innermost}}
        {/if}
      {/if}
    {/if}
  `,
})
export class MyApp {
  value = () => 1;
  // TODO(crisbeto): remove this once template type checking is fully implemented.
  root: any;
  inner: any;
  innermost: any;
}
