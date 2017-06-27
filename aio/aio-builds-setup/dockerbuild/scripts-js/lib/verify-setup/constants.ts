// Using the values below, we can fake the response of the corresponding methods in tests. This is
// necessary, because the test upload-server will be running as a separate node process, so we will
// not have direct access to the code (e.g. for mocking).
// (See also 'lib/verify-setup/start-test-upload-server.ts'.)

// Special values to be used as `authHeader` in `BuildVerifier#verify()`.
/* tslint:disable: variable-name */
export const BV_verify_error = 'FAKE_VERIFICATION_ERROR';
export const BV_verify_verifiedNotTrusted = 'FAKE_VERIFIED_NOT_TRUSTED';
/* tslint:enable: variable-name */
