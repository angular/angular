// Using the values below, we can fake the response of the corresponding methods in tests. This is
// necessary, because the test upload-server will be running as a separate node process, so we will
// not have direct access to the code (e.g. for mocking).
// (See also 'lib/verify-setup/start-test-upload-server.ts'.)

/* tslint:disable: variable-name */

// Special values to be used as `authHeader` in `BuildVerifier#verify()`.
export const BV_verify_error = 'FAKE_VERIFICATION_ERROR';
export const BV_verify_verifiedNotTrusted = 'FAKE_VERIFIED_NOT_TRUSTED';

// Special values to be used as `pr` in `BuildVerifier#getPrIsTrusted()`.
export const BV_getPrIsTrusted_error = 32203;
export const BV_getPrIsTrusted_notTrusted = 72457;

/* tslint:enable: variable-name */
