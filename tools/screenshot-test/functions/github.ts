import * as firebaseFunctions from 'firebase-functions';
import {setGithubStatus} from './util/github';

/** Github status update token */
const token = firebaseFunctions.config().secret.github;

/** The repo slug. This is used to validate the JWT is sent from correct repo. */
const repoSlug = firebaseFunctions.config().repo.slug;

/** Domain to view the screenshots */
const authDomain = firebaseFunctions.config().firebase.authDomain;

/** The same of this screenshot testing tool */
const toolName = firebaseFunctions.config().tool.name;

export function updateGithubStatus(event: firebaseFunctions.Event<any>) {
  if (!event.data.exists() || typeof event.data.val() != 'boolean' && event.params) {
    return;
  }

  const result = event.data.val() == true;
  const {prNumber, sha} = event.params!;

  return setGithubStatus(sha, {
      result: result,
      name: toolName,
      description: `${toolName} ${result ? 'passed' : 'failed'}`,
      url: `http://${authDomain}/${prNumber}`
  }, repoSlug, token);
}
