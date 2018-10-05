#!/bin/bash

# Fetch the install script and setup Yarn with the version from the Travis config.
curl -o- -L https://yarnpkg.com/install.sh | bash -s -- --version ${YARN_VERSION}

# Ensure that the profile-based Yarn installation is available within Bash as executable.
export PATH=$HOME/.yarn/bin:$PATH
