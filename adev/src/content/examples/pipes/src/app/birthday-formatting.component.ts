import {Component} from '@angular/core';
import {DatePipe} from '@angular/common';

@Component({
  selector: 'app-birthday-formatting',
  templateUrl: './birthday-formatting.component.html',
  imports: [DatePipe],
})
export class BirthdayFormattingComponent {
  birthday = new Date(1988, 3, 15); // April 15, 1988 -- since month parameter is zero-based
  toggle = true;

  get format() {
    return this.toggle ? 'mediumDate' : 'fullDate';
  }

  toggleFormat() {
    this.toggle = !this.toggle;
  }
}
