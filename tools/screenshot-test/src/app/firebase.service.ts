import {Injectable} from '@angular/core';
import {Http} from '@angular/http';
import * as firebase from 'firebase';
import 'rxjs/add/operator/toPromise';

const config = require('../config.json');

import {ScreenshotResultSummary} from './screenshot-result';

/** The service to fetch data from firebase database */
@Injectable()
export class FirebaseService {

  /** The current user */
  user: firebase.User;

  /** The screenshot results */
  screenshotResultSummary: ScreenshotResultSummary;

  constructor(private _http: Http) {
    // Initialize Firebase
    firebase.initializeApp(config.firebase);

    firebase.auth().onAuthStateChanged((user: firebase.User) => {
      this.user = user;
    });
  }


  /** Get the firebase storage test image folder url */
  getTestScreenshotImageUrl(filename: string): firebase.Promise<string> {
    return this._storageRef().child('test').child(filename).getDownloadURL();
  }

  /** Get the firebase storage diff image folder url */
  getDiffScreenshotImageUrl(filename: string): firebase.Promise<string> {
    return this._storageRef().child('diff').child(filename).getDownloadURL();
  }

  /** Get the firebase storage golden image folder url */
  getGoldScreenshotImageUrl(filename: string): firebase.Promise<string> {
    return firebase.storage().ref('goldens').child(filename).getDownloadURL();
  }

  /** Set pull request number. All test information and pull request information will be retrived
   * from database
   */
  set prNumber(prNumber: string) {
    this.screenshotResultSummary = new ScreenshotResultSummary();
    this.screenshotResultSummary.prNumber = prNumber;
    this._readPullRequestScreenshotReport();
  }

  _readPullRequestScreenshotReport() {
    if (!this.screenshotResultSummary.prNumber) {
      return;
    }

    this._databaseRef().on('value', (snapshot: firebase.database.DataSnapshot) => {
      let counter = 0;
      snapshot.forEach((childSnapshot: firebase.database.DataSnapshot) => {
        let childValue = childSnapshot.val();
        switch (childSnapshot.key) {
          case 'sha':
            this._readSha(childValue);
            break;
          case 'travis':
            this.screenshotResultSummary.travis = childValue;
            break;
          case 'results':
            this._readResults(childSnapshot);
            break;
        }

        counter++;
        return counter === snapshot.numChildren();
      });
    });
  }

  signIntoGithub(): firebase.Promise<void> {
    return firebase.auth().signInWithRedirect(new firebase.auth.GithubAuthProvider());
  }

  signOutFromGithub() {
    firebase.auth().signOut();
  }

  /** Change the PR status to approved to let Firebase Functions copy test images to goldens */
  approvePullRequest() {
    return this._databaseRef().child('approved').child(this.screenshotResultSummary.sha)
      .set(Date.now());
  }

  /**
   * Change the commit's screenshot test status on GitHub
   * The value in result/$sha/$result will trigger GitHub status update:
   *   true - The GitHub status for this SHA will become `success` for Screenshot Test
   *   false - The GitHub status for this SHA will become `failure` for Screenshot Test
   * In this dashboard, we only approve pull requests, so the value is always `true`
   */
  updatePullRequestResult() {
    return this._databaseRef().child('result').child(this.screenshotResultSummary.sha)
      .set(true);
  }

  /** Reference to the firebase database where the JSON test results and meatadate is stored. */
  _databaseRef(): firebase.database.Reference {
    return firebase.database().ref('screenshot').child('reports')
      .child(this.screenshotResultSummary.prNumber);
  }

  /** Reference to the firebase storage bucket where the screenshot PNG files are stored. */
  _storageRef(): firebase.storage.Reference {
    return firebase.storage().ref('screenshots').child(this.screenshotResultSummary.prNumber);
  }

  /** Read the results from database adn put the results in screenshotReusltSummary */
  _readResults(childSnapshot: firebase.database.DataSnapshot) {
    let childCounter = 0;
    this.screenshotResultSummary.collapse = [];
    this.screenshotResultSummary.testNames = [];
    this.screenshotResultSummary.testResultsByName.clear();
    childSnapshot.forEach((resultSnapshot: firebase.database.DataSnapshot) => {
      if (resultSnapshot.key) {
        this._addTestResults(resultSnapshot.key, resultSnapshot.val());
      }
      childCounter++;
      return childCounter === childSnapshot.numChildren();
    });
  }

  _addTestResults(name: string, value: boolean) {
    this.screenshotResultSummary.testResultsByName.set(name, value);
    this.screenshotResultSummary.testNames.push(name);
    this.screenshotResultSummary.collapse.push(value);
  }

  /** Read SHA and approved status from database and put them in ScreenshotResultSummary */
  _readSha(childValue) {
    this.screenshotResultSummary.sha = childValue;
    // Get github status
    this.getGithubStatus();
    // Get test allTestsPassedOrApproved
    this._databaseRef().child(`result/${childValue}`).once('value')
      .then((dataSnapshot: firebase.database.DataSnapshot) => {
        this.screenshotResultSummary.allTestsPassedOrApproved = dataSnapshot.val();
      });
    // Get the approved SHA and date time
    this._databaseRef().child(`approved/${childValue}`).once('value')
      .then((dataSnapshot: firebase.database.DataSnapshot) => {
        this.screenshotResultSummary.approvedTime = dataSnapshot.val();
      });
  }

  getGithubStatus() {
    let url =
      `https://api.github.com/repos/${config.repoSlug}/commits/` +
      `${this.screenshotResultSummary.sha}/status`;
    return this._http.get(url).toPromise()
      .then((response) => {
        let statusResponse = response.json();
        let screenshotStatus = statusResponse.statuses.find((status) =>
          status.context === 'Screenshot Tests');
        switch (screenshotStatus && screenshotStatus.state) {
          case 'success':
            this.screenshotResultSummary.githubStatus = true;
            break;
          case 'failure':
            this.screenshotResultSummary.githubStatus = false;
            return;
        }
      });
  }
}
