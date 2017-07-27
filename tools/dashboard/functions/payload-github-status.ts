import {https} from 'firebase-functions';
import {verifyToken} from './jwt/verify-token';
import {setGithubStatus} from './github/github-status';

export const payloadGithubStatus = https.onRequest(async (request, response) => {
  const authToken = request.header('auth-token');
  const commitSha = request.header('commit-sha');
  const packageName = request.header('package-name');
  const packageSize = parseFloat(request.header('package-full-size') || '');
  const packageDiff = parseFloat(request.header('package-size-diff') || '');

  if (!authToken || !verifyToken(authToken)) {
    return response.status(403).json({message: 'Auth token is not valid'});
  }

  if (!commitSha) {
    return response.status(404).json({message: 'No commit has been specified'});
  }

  if (isNaN(packageDiff)) {
    return response.status(400).json({message: 'No valid package difference has been specified.'});
  }

  if (isNaN(packageSize)) {
    return response.status(400).json({message: 'No full size of the package has been specified.'});
  }

  if (!packageName) {
    return response.status(400).json({message: 'No package name has been specified.'});
  }

  if (packageDiff === 0) {
    return response.status(400).json({message: `The difference equals zero. Status won't be set.`});
  }

  // Better message about the diff that shows whether the payload increased or decreased.
  const diffMessage = packageDiff < 0 ? 'decrease' : 'increase';
  const diffFormatted = Math.abs(packageDiff).toFixed(2);
  const packageSizeFormatted = packageSize.toFixed(2);

  await setGithubStatus(commitSha, {
    result: true,
    name: `${capitalizeFirstLetter(packageName)} Payload Size`,
    description: `${packageSizeFormatted}kb / ${diffFormatted}kb ${diffMessage} (ES2015 bundle)`
  });

  response.json({message: 'Payload Github status successfully set.'});
});

/** Capitalizes the first letter of a string. */
function capitalizeFirstLetter(word: string) {
  return word.charAt(0).toUpperCase() + word.slice(1).toLowerCase();
}
