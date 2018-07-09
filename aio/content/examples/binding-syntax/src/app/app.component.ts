import { Component, ViewChild, ElementRef } from '@angular/core';


@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css']
})
export class AppComponent {

  @ViewChild('bindingInput', { static: false }) bindingInput: ElementRef;

  isUnchanged = true;

  getHTMLAttributeValue(): any {
    console.warn('HTML attribute value: ' + this.bindingInput.nativeElement.getAttribute('value'));
  }

  getDOMPropertyValue(): any {
    console.warn('DOM property value: ' + this.bindingInput.nativeElement.value);
  }

  working(): any {
    console.warn('Test Button works!');
  }

  toggleDisabled(): any {

    let testButton = <HTMLInputElement> document.getElementById('testButton');
    testButton.disabled = !testButton.disabled;
    console.warn(testButton.disabled);
  }
}
