# VSCode Configuration

This folder contains opt-in [Workspace Settings](https://code.visualstudio.com/docs/getstarted/settings), [Tasks](https://code.visualstudio.com/docs/editor/tasks), [Launch Configurations](https://code.visualstudio.com/Docs/editor/debugging#_launch-configurations) and [Extension Recommendations](https://code.visualstudio.com/docs/editor/extension-gallery#_workspace-recommended-extensions) that the Angular team recommends using when working on this repository.

## Usage

To use the recommended configurations follow the steps below:

- install the recommended extensions in `.vscode/extensions.json`
- copy (or link) `.vscode/recommended-settings.json` to `.vscode/settings.json`
- copy (or link) `.vscode/recommended-launch.json` to `.vscode/launch.json`
- copy (or link) `.vscode/recommended-tasks.json` to `.vscode/tasks.json`
- restart the editor

If you already have your custom workspace settings, you should instead manually merge the file contents.

This isn't an automatic process, so you will need to repeat it when settings are updated.

To see the recommended extensions select "Extensions: Show Recommended Extensions" in the [Command Palette](https://code.visualstudio.com/docs/getstarted/userinterface#_command-palette).

## Editing `.vscode/recommended-*.json` files

If you wish to add extra configuration items please keep in mind any modifications you make here will be used by many users.

Try to keep these settings/configurations to things that help facilitate the development process and avoid altering the user workflow whenever possible.
