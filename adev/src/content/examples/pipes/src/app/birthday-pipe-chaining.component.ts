import {Component} from '@angular/core';
import {DatePipe, UpperCasePipe} from '@angular/common';

@Component({
  selector: 'app-birthday-pipe-chaining',
  templateUrl: './birthday-pipe-chaining.component.html',
  imports: [DatePipe, UpperCasePipe],
})
export class BirthdayPipeChainingComponent {
  birthday = new Date(1988, 3, 15); // April 15, 1988 -- since month parameter is zero-based
}
