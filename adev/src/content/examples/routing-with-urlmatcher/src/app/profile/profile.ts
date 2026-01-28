import {Component, input} from '@angular/core';

@Component({
  selector: 'app-profile',
  templateUrl: './profile.html',
  styleUrls: ['./profile.css'],
})
export class Profile {
  readonly username = input.required<string>();
}
