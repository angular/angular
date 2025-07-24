import {Component} from '@angular/core';

@Component({
    selector: 'test', template: '<a [someProp]></a>',
    standalone: false
})
export class FooCmp {
}
