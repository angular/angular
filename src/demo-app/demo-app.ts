import {Component} from 'angular2/core';
import {MdButton} from '../components/button/button';
import {MD_CARD_DIRECTIVES} from '../components/card/card';

@Component({
  selector: 'demo-app',
  providers: [],
  templateUrl: 'demo-app/demo-app.html',
  styleUrls: ['demo-app/demo-app.css'],
  directives: [MdButton, MD_CARD_DIRECTIVES],
  pipes: []
})
export class DemoApp { }
