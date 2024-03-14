import {Component} from '@angular/core';
import {ExampleProgressbarComponent} from './progress-bar.component';

@Component({
  standalone: true,
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css'],
  imports: [ExampleProgressbarComponent],
})
export class AppComponent2 {
  progress = 0;

  setProgress($event: Event) {
    this.progress = +($event.target as HTMLInputElement).value;
  }
}
