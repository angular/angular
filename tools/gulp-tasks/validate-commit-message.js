module.exports = (gulp) => () => {
  const validateCommitMessage = require('../validate-commit-message');
  const childProcess = require('child_process');

  // Get the branch name from CircleCi, default to master
  // https://circleci.com/docs/1.0/environment-variables/#build-details
  const branch = process.env.CIRCLE_BRANCH || 'master';

  // We need to fetch origin explicitly because it might be stale.
  // I couldn't find a reliable way to do this without fetch.
  childProcess.exec(
      `git fetch origin ${branch} && git log --reverse --format=%s HEAD ^origin/${branch}`,
      (error, stdout, stderr) => {
        if (error) {
          console.log(stderr);
          process.exit(1);
        }

        let someCommitsInvalid = false;
        let commitsByLine = stdout.trim().split(/\n/).filter(line => line != '');

        console.log(`Examining ${commitsByLine.length} commits between HEAD and ${branch}`);

        if (commitsByLine.length == 0) {
          console.log(`There are zero new commits between this HEAD and ${branch}`);
        }

        someCommitsInvalid = !commitsByLine.every(validateCommitMessage);

        if (someCommitsInvalid) {
          console.log('Please fix the failing commit messages before continuing...');
          console.log(
              'Commit message guidelines: https://github.com/angular/angular/blob/master/CONTRIBUTING.md#-commit-message-guidelines');
          process.exit(1);
        }
      });
};
