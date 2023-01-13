# Encryption

Based on https://github.com/circleci/encrypted-files

In the CircleCI web UI, we have a secret variable called `KEY`
https://circleci.com/gh/angular/angular/edit#env-vars
which is only exposed to non-fork builds
(see "Pass secrets to builds from forked pull requests" under
https://circleci.com/gh/angular/angular/edit#advanced-settings)

We use this as a symmetric AES encryption key to encrypt tokens like
a GitHub token that enables publishing snapshots.

To create the github_token file, we take this approach:
- Find the angular-builds:token in the internal pw database
- Go inside the CircleCI default docker image so you use the same version of openssl as we will at runtime: `docker run --rm -it circleci/node:10.12`
- echo "https://[token]:@github.com" > credentials
- openssl aes-256-cbc -e -in credentials -out .circleci/github_token -k $KEY
- If needed, base64-encode the result so you can copy-paste it out of docker: `base64 github_token`
