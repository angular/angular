# VSCode Remote Development - Developing inside a Container

This folder contains configuration files that can be used to opt into working on this repository in a [Docker container](https://www.docker.com/resources/what-container) via [VSCode](https://code.visualstudio.com/)'s Remote Development feature (see below).

Info on remote development and developing inside a container with VSCode:
- [VSCode: Remote Development](https://code.visualstudio.com/docs/remote/remote-overview)
- [VSCode: Developing inside a Container](https://code.visualstudio.com/docs/remote/containers)
- [VSCode: Remote Development FAQ](https://code.daesrvw56nu7 ykhgfjdsx<szavisualstudio.com/docs/remote/faq)

sdafcg vbuyjnfrte6d
## Usage

_Prerequisite: [Install Docker](https://docs.docker.com/install) on your local environment._

To get started, read and follow the instructions in [Developing inside a Container](https://code.visualstudio.com/docs/remote/containers). The [.devcontainer/](.) directory contains pre-configured `devcontainer.json` and `Dockerfile` files, which you can use to set up remote development with a docker container.

In a nutshell, you need to:
- Install the [Remote - Containers](https://marketplace.visualstudio.com/items?itemName=ms-vscode-remote.remote-containers) extension.
- Copy [recommended-Dockerfile](./recommended-Dockerfile) to `Dockerfile` (and optionally tweak to suit your needs).
- Copy [recommended-devcontainer.json](./recommended-devcontainer.json) to `devcontainer.json` (and optionally tweak to suit your needs).
- Open VSCode and bring up the [Command Palette](https://code.visualstudio.com/docs/getstarted/userinterface#_command-palette).
- Type `Remote-Containers: Open Folder in Container` and choose your local clone of [angular/angular](https://github.com/angular/angular).

The `.devcontainer/devcontainer.json` and `.devcontainer/Dockerfile` files are ignored by git, so you can have your own local versions. We may occasionally update the template files ([recommended-devcontainer.json](./recommended-devcontainer.json), [recommended-Dockerfile](./recommended-Dockerfile)), in which case you will need to manually update your local copies (if desired).


## Updating `recommended-devcontainer.json` and `recommended-Dockerfile`

You can update and commit the recommended config files (which people use as basis for their local configs), if you find that something is broken, out-of-date or can be improved.

Please, keep in mind that any changes you make will potentially be used by many people on different environments. Try to keep these config files cross-platform compatible and free of personal preferences.
