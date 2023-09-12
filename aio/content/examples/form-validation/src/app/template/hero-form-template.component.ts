import { Component } from '@angular/core';
import { UniqueAlterEgoValidatorDirective } from '../shared/alter-ego.directive';
import { NgIf, NgFor } from '@angular/common';
import { ForbiddenValidatorDirective } from '../shared/forbidden-name.directive';
import { IdentityRevealedValidatorDirective } from '../shared/identity-revealed.directive';
import { FormsModule } from '@angular/forms';

@Component({
  standalone: true,
  selector: 'app-hero-form-template',
  templateUrl: './hero-form-template.component.html',
  styleUrls: ['./hero-form-template.component.css'],
  imports: [
    ForbiddenValidatorDirective,
    FormsModule,
    IdentityRevealedValidatorDirective,
    NgFor,
    NgIf,
    UniqueAlterEgoValidatorDirective,
  ],
})
export class HeroFormTemplateComponent {
  powers = ['Really Smart', 'Super Flexible', 'Weather Changer'];

  hero = { name: 'Dr.', alterEgo: 'Dr. What', power: this.powers[0] };
}
