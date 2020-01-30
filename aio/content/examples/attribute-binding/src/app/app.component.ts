import { Component } from '@angular/core';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css']
})
export class AppComponent {
  actionName = 'Go for it';
  isSpecial = true;
  canSave = true;
  someClasses = 'foo bar';
  classExpr = 'special foo';
  styleExpr = 'color: red';
  color = 'blue';
}
