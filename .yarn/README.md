# Yarn Vendoring
We utilize Yarn's `yarn-path` configuration in a shared `.yarnrc` file to enforce
everyone using the same version of Yarn.  Yarn checks the `.yarnrc` file to
determine if yarn should delegate the command to a vendored version at the
provided path.

## How to update
To update to the latest version of Yarn as our vendored version:
- Run this command
```sh
yarn policies set-version latest
```
- Remove the previous version
