// #docregion
import { Component } from '@angular/core';

@Component({
  selector: 'app-inner-html-binding',
  templateUrl: './inner-html-binding.component.html',
})
// #docregion class
export class InnerHtmlBindingComponent {
  // HTML 코드에 악성 코드가 포함되어 있을 수 있습니다.
  htmlSnippet = 'Template <script>alert("0wned")</script> <b>Syntax</b>';
}
