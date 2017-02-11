module.exports = (gulp) => () => {
  const validateCommitMessage = require('../validate-commit-message');
  const childProcess = require('child_process');

  // We need to fetch origin explicitly because it might be stale.
  // I couldn't find a reliable way to do this without fetch.
  childProcess.exec(
      'git fetch origin master && git log --reverse --format=%s HEAD ^origin/master',
      (error, stdout, stderr) => {
        if (error) {
          console.log(stderr);
          process.exit(1);
        }

        let someCommitsInvalid = false;
        let commitsByLine = stdout.trim().split(/\n/).filter(line => line != '');

        console.log(`Examining ${commitsByLine.length} commits between HEAD and master`);

        if (commitsByLine.length == 0) {
          console.log('There are zero new commits between this HEAD and master');
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
