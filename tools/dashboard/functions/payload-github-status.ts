import {https} from 'firebase-functions';
import {verifyToken} from './jwt/verify-token';
import {setGithubStatus} from './github/github-status';

export const payloadGithubStatus = https.onRequest(async (request, response) => {
  const authToken = request.header('auth-token');
  const commitSha = request.header('commit-sha');
  const payloadDiff = parseInt(request.header('commit-payload-diff'));

  if (!verifyToken(authToken)) {
    return response.status(403).json({message: 'Auth token is not valid'});
  }

  if (!commitSha) {
    return response.status(404).json({message: 'No commit has been specified'});
  }

  if (!payloadDiff || isNaN(payloadDiff)) {
    return response.status(400).json({message: 'No valid payload diff has been specified.'});
  }

  await setGithubStatus(commitSha, {
    result: true,
    name: 'Library Payload',
    url: `https://travis-ci.org/angular/material2/jobs/${process.env['TRAVIS_JOB_ID']}`,
    description: `${payloadDiff > 0 ? `+` : ''} ${payloadDiff.toFixed(2)}KB`
  });

  response.json({message: 'Payload Github status successfully set.'});
});
