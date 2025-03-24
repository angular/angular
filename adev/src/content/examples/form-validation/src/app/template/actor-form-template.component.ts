import {Component} from '@angular/core';

@Component({
  selector: 'app-actor-form-template',
  templateUrl: './actor-form-template.component.html',
  styleUrls: ['./actor-form-template.component.css'],
  standalone: false,
})
export class ActorFormTemplateComponent {
  skills = ['Method Acting', 'Singing', 'Dancing', 'Swordfighting'];

  actor = {name: 'Tom Cruise', role: 'Romeo', skill: this.skills[3]};
}
