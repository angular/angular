const config = require('../config.json');
/**
 * Results for a screenshot test
 * Has all related information including Travis Job ID, SHA, pull request number.
 * And the test results for each test.
 */
export class ScreenshotResultSummary {
  /** PR information: the pull request number */
  prNumber: string;
  /** PR information: the sha of the pull request commit */
  sha: string;
  /** PR information: The travis job ID */
  travis: string;

  /** The names of the tests that have screenshot results */
  testNames: string[];
  /**
   * Test result: passed or failed. The value can be true if test failed but
   * PR approved by user
   */
  allTestsPassedOrApproved: boolean;
  /** Test results: passed or failed for each test */
  testResultsByName: Map<string, boolean> = new Map<string, boolean>();
  /**
   * Test approved: whether the test images are copied to goldens.
   * The value is the date/time of approval of current commit. Null if never approved.
   */
  approvedTime: number;

  githubStatus: boolean;

  /** Viewing mode, can be flip, diff, side */
  mode: 'diff' | 'side' | 'flip' = 'diff';
  /** When in "Flip" mode, whether the test result or the gold screenshot is being shown. */
  isFlipped: boolean = false;
  /** Viewing collapsed: whether the result should be collapsed/expanded */
  collapse: boolean[];

  setCollapse(value: boolean) {
    if (this.collapse) {
      for (let i = 0; i < this.collapse.length; i++) {
        this.collapse[i] = value;
      }
    }
  }

  get prUrl() {
    return `https://github.com/${config.repoSlug}/pull/${this.prNumber}`;
  }

  get commitLink() {
    return `https://github.com/${config.repoSlug}/commit/${this.sha}`;
  }

  get travisLink() {
    return `https://travis-ci.org/${config.repoSlug}/jobs/${this.travis}`;
  }
}
