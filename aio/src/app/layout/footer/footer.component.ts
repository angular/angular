import { Component, Input } from '@angular/core';

import { GoogleFeedbackService } from 'app/shared/google-feedback.service';
import { NavigationNode, VersionInfo } from 'app/navigation/navigation.service';

@Component({
  selector: 'aio-footer',
  templateUrl: 'footer.component.html'
})
export class FooterComponent {
  @Input() nodes: NavigationNode[];
  @Input() versionInfo: VersionInfo;

  constructor(private feedback: GoogleFeedbackService) {  }

  action(node: NavigationNode) {
    // There is only one action at this time, site feedback
    // so don't bother to analyze the node; just do the action.
    this.feedback.openFeedback();
  }
}
