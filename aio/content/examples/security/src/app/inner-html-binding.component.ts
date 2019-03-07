// #docregion
import { Component } from '@angular/core';

@Component({
  selector: 'app-inner-html-binding',
  templateUrl: './inner-html-binding.component.html',
})
// #docregion class
export class InnerHtmlBindingComponent {
  // URL을 통해 악성 코드가 실행될 수 있습니다.
  htmlSnippet = 'Template <script>alert("0wned")</script> <b>Syntax</b>';
}
