import { Component, OnInit, Input } from '@angular/core';

@Component({
  selector: 'app-string-init',
  templateUrl: './string-init.component.html',
  styleUrls: ['./string-init.component.css']
})
export class StringInitComponent implements OnInit {

  @Input() prefix: string;

  constructor() { }

  ngOnInit() {
  }

}
