import {Component} from '@angular/core';

@Component({
  template: `
    {#if value(); as root}
      <button (click)="log(value(), root)"></button>

      {#if value(); as inner}
        <button (click)="log(value(), root, inner)"></button>

        {#if value(); as innermost}
          <button (click)="log(value(), root, inner, innermost)"></button>
        {/if}
      {/if}
    {/if}
  `,
})
export class MyApp {
  value = () => 1;
  log(..._: any[]) {}
  // TODO(crisbeto): remove this once template type checking is fully implemented.
  root: any;
  inner: any;
  innermost: any;
}
