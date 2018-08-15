# Extra files folder

This folder is used for extra files that should be included in deployments to firebase.

After the AIO application had been built and before it is deployed all files and folders
inside the folder with the same name as the current deployment mode (next, stable, archive)
will be copied to the `dist` folder.

See the `scripts/deploy-to-firebase.sh` script for more detail.

**Note:**
The `deploy-to-firebase.sh` script always expects there to be a folder for the current deployment
mode (even if it is empty).
