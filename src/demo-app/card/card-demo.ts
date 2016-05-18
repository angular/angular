import {Component} from '@angular/core';
import {MdButton} from '@angular2-material/button/button';
import {MD_CARD_DIRECTIVES} from '@angular2-material/card/card';

@Component({
  moduleId: module.id,
  selector: 'card-demo',
  templateUrl: 'card-demo.html',
  styleUrls: ['card-demo.css'],
  directives: [MD_CARD_DIRECTIVES, MdButton]
})
export class CardDemo {}
