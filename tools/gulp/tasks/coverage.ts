import {task} from 'gulp';
import {existsSync} from 'fs-extra';
import {COVERAGE_RESULT_FILE} from '../constants';
import {spawnSync} from 'child_process';
import {isTravisPushBuild} from '../util/travis-ci';
import {openFirebaseDashboardDatabase} from '../util/firebase';

task('coverage:upload', () => {
  if (!existsSync(COVERAGE_RESULT_FILE)) {
    throw new Error('No coverage file has been found!');
  }

  if (!isTravisPushBuild()) {
    throw new Error('Coverage results will be only uploaded inside of Travis Push builds.');
  }

  let results = require(COVERAGE_RESULT_FILE)['total'];

  // To reduce database payload, the covered lines won't be pushed to the Firebase database.
  delete results['linesCovered'];

  return uploadResults(results);
});

/** Uploads the coverage results to the firebase database. */
function uploadResults(results: any): Promise<void> {
  let latestSha = spawnSync('git', ['rev-parse', 'HEAD']).stdout.toString().trim();
  let database = openFirebaseDashboardDatabase();

  return database.ref('coverage-reports').child(latestSha).set(results)
    .then(() => database.goOffline(), () => database.goOffline());
}

// TODO(devversion): In the future we might have a big database where we can store full summaries.
// TODO(devversion): We could also move the coverage to a bot and reply with the results on PRs.
