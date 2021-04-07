import {SemVer} from 'semver';
import {GitClient} from '../../../utils/git';
import {getReleaseConfig} from '../../config';
import {ReleaseVersionAndNotesUpdateTask} from './version-and-changelog-update';

(async () => {
  GitClient.getInstance().setGithubToken(process.env['TOKEN']!);
  const task = new ReleaseVersionAndNotesUpdateTask(getReleaseConfig());

  await task.stage(new SemVer('12.0.0'), 'release-tasks');
})();
