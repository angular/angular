"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.logGitHubEvent = void 0;
const functions = require("firebase-functions");
const admin = require("firebase-admin");
const crypto = require("crypto");
admin.initializeApp();
exports.logGitHubEvent = functions.https.onRequest(async (req, response) => {
    // GitHub webhook has a secret associated with it. We have the same secret in the Firebase
    // function config. We sha1 hash that secret from config and compare it to what GitHub sent.
    const signatureFromGithub = req.headers['x-hub-signature'];
    const hmac = crypto.createHmac('sha1', functions.config().github.secret)
        .update(req.rawBody)
        .digest('hex');
    const expectedSignature = `sha1=${hmac}`;
    if (signatureFromGithub !== expectedSignature) {
        console.error('x-hub-signature', signatureFromGithub, 'did not match', expectedSignature);
        return response.status(403).send('x-hub-signature does not match expected signature');
    }
    // We only care about label events for the fix-it
    if (req.body.action === 'labeled' || req.body.action === 'closed' || req.body.action === 'unlabeled') {
        // Handle events differently for each repo.
        switch (req.body.repository.full_name) {
            case ('angular/components'):
                await processComponentsEvent(req.body);
                break;
        }
    }
    return response.status(200).send();
});
async function processComponentsEvent(event) {
    // Log ALL events in case we want extra data
    await logActionToDatabase('components', {
        action: event.action,
        issueNumber: event.issue.number,
        label: event.label.name,
        user: event.sender.login,
        timestamp: Date.now(),
    });
    const triageLabelExp = /(P\d)|(needs clarification)|(cannot reproduce)/;
    const triageLabel = event.label && triageLabelExp.test(event.label.name) ? event.label.name : '';
    if (event.action === 'closed' || (triageLabel && event.action === 'labeled')) {
        return writeTriageEventToDatabase('components', {
            action: event.action,
            issueNumber: event.issue.number,
            label: triageLabel,
            user: event.sender.login,
            timestamp: Date.now(),
        });
    }
    return Promise.resolve();
}
async function writeTriageEventToDatabase(repo, triageData) {
    // Use `set` rather than push so that we key by issue number.
    return admin.database().ref(`/${repo}/${triageData.issueNumber}`).set(triageData);
}
async function logActionToDatabase(repo, triageData) {
    // Use `set` rather than push so that we key by issue number.
    return admin.database().ref(`/${repo}-actions/${triageData.issueNumber}`).push(triageData);
}
//# sourceMappingURL=index.js.map