"""
    Script that sets up the Angular snapshot github builds. We set up the snapshot builds by
    overwriting the versions in the "package.json" and taking advantage of Yarn's resolutions
    feature. Yarn resolutions will be used to flatten nested Angular packages because by default
    Yarn does not flatten any dependency. See:

    node_modules/compiler@snapshot
    node_modules/compiler-cli@snapshot
      node_modules/compiler@7.0.1

    Note that we cannot just use Yarn's `--flat` option because that would mean that it tries
    to flatten **all** dependencies and could cause unexpected results. We **only** want to
    explicitly flatten out all `@angular/*` dependencies. This can be achieved with resolutions.
    Read more here: https://yarnpkg.com/lang/en/docs/package-json/#toc-resolutions

    **Note** that this script has to be written in Python because the docker container which
    is used for our CI does not come with NodeJS pre-installed. Since this script needs to run
    before the Bazel analysis phase is started, we can only run this script only with tools that
    are pre-installed in the image. Python is a pre-installed in the google/bazel official image
    and therefore we use that for the "package.json" modification. Note that this script is only
    running on CI and therefore there are no implications with writing this in python.
"""

import json
import os
import argparse

def collect_angular_deps(obj, result):
    for item in obj:
        if (item.startswith('@angular/')):
            result.append(item)

project_dir = os.path.realpath(os.path.join(os.path.dirname(__file__), '../../'))
package_json_path = os.path.join(project_dir, 'package.json')

parser = argparse.ArgumentParser(description='Setup Angular snapshot packages')
parser.add_argument('--tag', required = True)
parsed_args = parser.parse_args()

with open(package_json_path, 'r') as package_json:
    data = json.load(package_json)
    angular_pkgs = []

    collect_angular_deps(data['dependencies'], angular_pkgs)
    collect_angular_deps(data['devDependencies'], angular_pkgs)

    if not 'resolutions' in data:
        data['resolutions'] = {}

    print('Setting up snapshot builds for:')

    for pkg in angular_pkgs:
        new_url = "github:angular/%s-builds#%s" % (pkg.split('/')[1], parsed_args.tag)

        print("  %s -> %s" % (pkg, new_url))

        # Add resolutions for each package in the format "**/{PACKAGE}" so that all
        # nested versions of that specific Angular package will have the same version.
        data['resolutions']['**/%s' % pkg] = new_url

        # Since the resolutions only cover the version of all nested installs, we also need
        # to explicitly set the version for the package listed in the project "package.json".
        data['dependencies'][pkg] = new_url

        # In case this dependency was previously a dev dependency, just remove it because we
        # re-added it as a normal dependency for simplicity.
        if pkg in data['devDependencies']:
            del data['devDependencies'][pkg]

    new_package_json = json.dumps(data, indent = 2)

    with open(package_json_path, 'w') as package_json_out:
        package_json_out.write(new_package_json)

    print('')
    print('Successfully added the "resolutions" to the "package.json".')
    print('Please run "yarn install" in the project to update the lock file.')
