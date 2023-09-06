import {Component, Input} from '@angular/core';
import {Hero} from '../hero';
import {FormsModule} from '@angular/forms';
import {NgIf, UpperCasePipe} from '@angular/common';

@Component({
  selector: 'app-hero-detail',
  templateUrl: './hero-detail.component.html',
  styleUrls: ['./hero-detail.component.css'],
  standalone: true,
  imports: [NgIf, FormsModule, UpperCasePipe],
})
export class HeroDetailComponent {
  @Input() hero: Hero | undefined;
}
