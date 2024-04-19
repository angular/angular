####################################################################################################
# Set bazel configuration for CircleCI runs.
####################################################################################################
cp "${PROJECT_ROOT}/.circleci/bazel.windows.rc" ".bazelrc.user";

# Override the `PATH` environment variable so that the windows-nvm NodeJS version
# always has precedence over potential existing NodeJS versions from the image.
setPublicVar PATH "/c/Program Files/nodejs/:$PATH"

# Expose the Bazelisk version. We need to run Bazelisk globally since Windows has problems launching
# Bazel from a node modules directoy that might be modified by the Bazel Yarn install then.
setPublicVar BAZELISK_VERSION \
    "$(cd ${PROJECT_ROOT}; node -p 'require("./package.json").devDependencies["@bazel/bazelisk"]')"
