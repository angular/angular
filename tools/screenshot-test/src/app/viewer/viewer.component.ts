import {Component, Input} from '@angular/core';
import {ActivatedRoute} from '@angular/router';
import {MatSnackBar} from '@angular/material';
import {FirebaseService} from '../firebase.service';

/**
 * Component to show test results for one commit. The github status, pull request and travis job
 * information, test result and commit SHA are visible.
 * User can approve the change by updating the github status, or by updating the goldens.
 */
@Component({
  selector: 'app-viewer',
  templateUrl: './viewer.component.html',
  styleUrls: ['./viewer.component.css']
})
export class ViewerComponent {
  messageDuration = {duration: 10000};

  get isApproved() {
    return !!this._service.screenshotResultSummary.approvedTime;
  }

  get screenshotResultSummary() {
    return this._service.screenshotResultSummary;
  }

  get githubIcon(): string {
    return this.githubStatus ? 'check' : 'close';
  }

  @Input()
  get githubStatus() {
    return this.screenshotResultSummary.githubStatus;
  }

  get githubClass(): string {
    return this.githubStatus ? 'passed' : 'failed';
  }

  constructor(private _service: FirebaseService,
              public snackBar: MatSnackBar,
              activatedRoute: ActivatedRoute) {
    activatedRoute.params.subscribe(p => {
      this._service.prNumber = p['id'];
    });
  }

  approve() {
    this._service.approvePullRequest().then(() => {
      this.snackBar.open(`Approved`, '', this.messageDuration);
    }).catch((error) => {
      this.snackBar.open(`Error ${error}`, '', this.messageDuration);
    });
  }

  updateGithubStatus() {
    this._service.updatePullRequestResult().then(() => {
      this.snackBar.open(`Approved`, '', this.messageDuration);
    }).catch((error) => {
      this.snackBar.open(error.message, '', this.messageDuration);
    });
  }

  refreshGithubStatus() {
    this._service.getGithubStatus();
  }
}
