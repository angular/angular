import {Component} from '@angular/core';
import {MdGridList} from '../../components/grid-list/grid-list';

@Component({
  selector: 'grid-list-demo',
  templateUrl: 'demo-app/grid-list/grid-list-demo.html',
  styleUrls: ['demo-app/grid-list/grid-list-demo.css'],
  directives: [MdGridList]
})
export class GridListDemo {}
