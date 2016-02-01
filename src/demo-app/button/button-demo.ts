import {Component} from 'angular2/core';
import {MdButton} from '../../components/button/button';

@Component({
    selector: 'button-demo',
    templateUrl: 'demo-app/button/button-demo.html',
    styleUrls: ['demo-app/button/button-demo.css'],
    directives: [MdButton]
})
export class ButtonDemo {}