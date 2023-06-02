import {Component, input, Input} from '@angular/core';
import {bootstrapApplication} from '@angular/platform-browser';

@Component({
  selector: 'greet',
  standalone: true,
  signals: true,
  template: `{{ counter() }}`,
})
export class Greet<T> {
  counter = input(0);
  bla = input();  // TODO: should be a diagnostic. no type & no value
  bla2 = input<string>()
  bla3 = input({initialValue: 3, required: true});
  bla4 = input(3, {required: true, alias: 'bla4Public'})
  gen = input<T>({required: true});
  gen2 = input<T>();

  works(): T {
    return this.gen();
  }

  // TODO: should break, but still supported early prototype.
  @Input() oldInput: string|undefined;
}

@Component({
  standalone: true,
  selector: 'my-app',
  template: `
    Hello <greet [counter]="3" [bla4Public]="10" #ok
      [bla3]="-10" [gen]="{yes: true}"
    />

    <button (click)="ok.works().yes">Click</button>
  `,
  imports: [Greet],
})
export class MyApp {
}

bootstrapApplication(MyApp).catch((e) => console.error(e));
