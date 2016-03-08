import {Component} from 'angular2/core';
import {MdButton} from '../../components/button/button';
import {MD_CARD_DIRECTIVES} from '../../components/card/card';

@Component({
    selector: 'card-demo',
    templateUrl: 'demo-app/card/card-demo.html',
    styleUrls: ['demo-app/card/card-demo.css'],
    directives: [MD_CARD_DIRECTIVES, MdButton]
})
export class CardDemo {}
