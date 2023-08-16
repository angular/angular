import {Component, Pipe} from '@angular/core';

@Pipe({standalone: true, name: 'test'})
export class TestPipe {
  tranform(value: unknown) {
    return value;
  }
}

@Component({
  template: `
    <div>
      {{message}}
      {#if (val | test) === 1}
        one
        {:else if (val | test) === 2} two
        {:else} three
      {/if}
    </div>
  `,
})
export class MyApp {
  message = 'hello';
  val = 1;
}
