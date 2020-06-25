import { Component, OnInit, ContentChild } from '@angular/core';
// import { HeaderComponent } from '../header/header.component'; // <- don't need this for treeshakable, only for non-treeshakable version
import { LibHeaderToken } from '../header/lib-header-token';

@Component({
  selector: 'lib-card',
  templateUrl: './card.component.html',
  styleUrls: ['./card.component.css']
})
export class CardComponent implements OnInit {

  // This one is not tree shakable. Don't do this.
  // @ContentChild(HeaderComponent) header: HeaderComponent|null = null;

  // This one is tree shakable. Do this! 
  @ContentChild(LibHeaderToken) header: LibHeaderToken|null = null;

  constructor() { }

  ngOnInit() {
  }

}
