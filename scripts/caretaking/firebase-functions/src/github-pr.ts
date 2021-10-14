import * as functions from 'firebase-functions';
import * as admin from 'firebase-admin';

export const githubPR = functions.https.onRequest(async (req, resp) => {
  const github = req.body;
  const action = req.get('X-GitHub-Event');
  const fullRepoName = github.repository.full_name.replace(/[\.\#\$\[\]]/g, '');
  let actionTaken = 'None';
  let prEffected = 'Unknown';
  if (action === 'pull_request') {
    const pullsRef = admin.database().ref(`/pulls/${fullRepoName}/${github.number}/github`);
    const pull_request = github.pull_request;
    pullsRef.update({
      'branch': pull_request.base.ref,
      'title': pull_request.title,
      'pull_number': pull_request.number,
      'state': pull_request.state,
      'commit_sha': pull_request.head.sha,
      'author': pull_request.user,
      'labels': pull_request.labels,
      'created_at': pull_request.created_at,
      'updated_at': pull_request.updated_at,
    });
    prEffected = pull_request.number;
    actionTaken = 'Updated PR';
  } else if (action === 'status') {
    const ref = admin
      .database()
      .ref(`/pulls/${fullRepoName}`)
      .orderByChild('github/commit_sha')
      .equalTo(github.sha);
    await ref.once('value', snapshot => {
      snapshot.forEach(d => {
        d.child(`statuses`).ref.update({
          [github.context.replace(/\W/g, '')]: {
            context: github.context,
            build_url: github.target_url,
            status: github.state,
          },
        });
        prEffected = d.val().github.pull_number;
        actionTaken = 'Updated Status';
      });
    });
  }

  const logAndOutputString = `Repo: ${fullRepoName} | PR: ${prEffected} | Action: ${actionTaken}`;
  console.log(logAndOutputString);
  resp.send(logAndOutputString);
});
