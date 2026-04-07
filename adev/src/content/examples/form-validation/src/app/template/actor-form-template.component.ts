import {Component} from '@angular/core';
import {FormsModule} from '@angular/forms';
import {UnambiguousRoleValidatorDirective} from '../shared/unambiguous-role.directive';
import {ForbiddenValidatorDirective} from '../shared/forbidden-name.directive';
import {UniqueRoleValidatorDirective} from '../shared/role.directive';

@Component({
  selector: 'app-actor-form-template',
  templateUrl: './actor-form-template.component.html',
  styleUrls: ['./actor-form-template.component.css'],
  imports: [
    UnambiguousRoleValidatorDirective,
    FormsModule,
    ForbiddenValidatorDirective,
    UniqueRoleValidatorDirective,
  ],
})
export class ActorFormTemplateComponent {
  skills = ['Method Acting', 'Singing', 'Dancing', 'Swordfighting'];

  actor = {name: 'Tom Cruise', role: 'Romeo', skill: this.skills[3]};
}
