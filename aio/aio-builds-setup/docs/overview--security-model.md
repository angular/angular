# Overview - Security model


Whenever a PR job is run on Travis, we want to build `angular.io` and upload the build artifacts to
a publicly accessible server so that collaborators (developers, designers, authors, etc) can preview
the changes without having to checkout and build the app locally.

This document discusses the security considerations associated with uploading build artifacts as
part of the CI setup and serving them publicly.


## Security objectives

- **Prevent uploading arbitrary content to our servers.**
  Since there is no restriction on who can submit a PR, we cannot allow any PR's build artifacts to
  be uploaded.

- **Prevent overwriting other peoples uploaded content.**
  There needs to be a mechanism in place to ensure that the uploaded content does indeed correspond
  to the PR indicated by its URL.

- **Prevent arbitrary access on the server.**
  Since the PR author has full access over the build artifacts that would be uploaded, we must
  ensure that the uploaded files will not enable arbitrary access to the server or expose sensitive
  info.


## Issues / Caveats

- Because the PR author can change the scripts run on CI, any security mechanisms must be immune to
  such changes.

- For security reasons, encrypted Travis variables are not available to PRs, so we can't rely on
  them to implement security.


## Implemented approach


### In a nutshell
The implemented approach can be broken up to the following sub-tasks:

1. Verify which PR the uploaded artifacts correspond to.
2. Fetch the PR's metadata, including author and labels.
3. Check whether the PR can be automatically verified as "trusted" (based on its author or labels).
4. If necessary, update the corresponding PR's verification status.
5. Deploy the artifacts to the corresponding PR's directory.
6. Prevent overwriting previously deployed artifacts (which ensures that the guarantees established
   during deployment will remain valid until the artifacts are removed).
7. Prevent uploaded files from accessing anything outside their directory.


### Implementation details
This section describes how each of the aforementioned sub-tasks is accomplished:

1. **Verify which PR the uploaded artifacts correspond to.**

   We are taking advantage of Travis' [JWT addon](https://docs.travis-ci.com/user/jwt). By sharing
   a secret between Travis (which keeps it private but uses it to sign a JWT) and the server (which
   uses it to verify the authenticity of the JWT), we can accomplish the following:
   a. Verify that the upload request comes from Travis.
   b. Determine the PR that these artifacts correspond to (since Travis puts that information into
      the JWT, without the PR author being able to modify it).

   _Note:_
   _There are currently certain limitation in the implementation of the JWT addon._
   _See the next section for more details._

2. **Fetch the PR's metadata, including author and labels**.

   Once we have securely associated the uploaded artifacts to a PR, we retrieve the PR's metadata -
   including the author's username and the labels - using the
   [GitHub API](https://developer.github.com/v3/).
   To avoid rate-limit restrictions, we use a Personal Access Token (issued by
   [@mary-poppins](https://github.com/mary-poppins)).

3. **Check whether the PR can be automatically verified as "trusted"**.

   "Trusted" means that we are confident that the build artifacts are suitable for being deployed
   and publicly accessible on the preview server. There are two ways to check that:
   1. We can verify that the PR has a pre-determined label, which marks it as "safe for preview".
      Such a label can only have been added by a maintainer (with the necessary rights) and
      designates that they have manually verified the PR contents.
   2. We can verify (again using the GitHub API) the author's membership in one of the
      whitelisted/trusted GitHub teams. For this operation, we need a Personal Access Token with the
      `read:org` scope issued by a user that can "see" the specified GitHub organization.
      Here too, we use the token by @mary-poppins.

4. **If necessary update the corresponding PR's verification status**.

   Once we have determined whether the PR is considered "trusted", we update its "visibility" (i.e.
   whether it is publicly accessible or not), based on the new verification status. For example, if
   a PR was initially considered "not trusted" but the check triggered by a new build determined
   otherwise, the PR (and all the previously uploaded previews) are made public. It works the same
   way if a PR has gone from "trusted" to "not trusted".

5. **Deploy the artifacts to the corresponding PR's directory.**

   With the preceding steps, we have verified that the uploaded artifacts have been uploaded by
   Travis. Additionally, we have determined whether the PR can be trusted to have its previews
   publicly accessible or whether further verification is necessary. The artifacts will be stored to
   the PR's directory, but will not be publicly accessible unless the PR has been verified.
   Essentially, as long as sub-tasks 1, 2 and 3 can be securely accomplished, it is possible to
   "project" the trust we have in a team's members through the PR and Travis to the build artifacts.

6. **Prevent overwriting previously deployed artifacts**.

   In order to enforce this restriction (and ensure that the deployed artifacts' validity is
   preserved throughout their "lifetime"), the server that handles the upload (currently a Node.js
   Express server) rejects uploads that target an existing directory.
   _Note: A PR can contain multiple uploads; one for each SHA that was built on Travis._

7. **Prevent uploaded files from accessing anything outside their directory.**

   Nginx (which is used to serve the uploaded artifacts) has been configured to not follow symlinks
   outside of the directory where the build artifacts are stored.


## Assumptions / Things to keep in mind

- Each trusted PR author has full control over the content that is uploaded for their PRs. Part of
  the security model relies on the trustworthiness of these authors.

- Adding the specified label on a PR and marking it as trusted, gives the author full control over
  the content that is uploaded for the specific PR (e.g. by pushing more commits to it). The user
  adding the label is responsible for ensuring that this control is not abused and that the PR is
  either closed (one way of another) or the access is revoked.

- If anyone gets access to the `PREVIEW_DEPLOYMENT_TOKEN` (a.k.a. `NGBUILDS_IO_KEY` on
  angular/angular) variable generated for each Travis job, they will be able to impersonate the
  corresponding PR's author on the preview server for as long as the token is valid (currently 90
  mins). Because of this, the value of the `PREVIEW_DEPLOYMENT_TOKEN` should not be made publicly
  accessible (e.g. by printing it on the Travis job log).

- Travis does only allow specific whitelisted property names to be used with the JWT addon. The only
  known such property at the time is `SAUCE_ACCESS_KEY` (used for integration with SauceLabs). In
  order to be able to actually use the JWT addon we had to name the encrypted variable
  `SAUCE_ACCESS_KEY` (which we later re-assign to `NGBUILDS_IO_KEY`).
