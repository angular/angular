import {ChangeDetectorRef, Component} from '@angular/core';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
})
export class AppComponent {
  counter = 0;

  constructor(private _cd: ChangeDetectorRef) {}

  increment(): void {
    this.counter++;
    this._cd.detectChanges();
  }
}
