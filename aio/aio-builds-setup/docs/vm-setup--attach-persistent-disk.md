# VM setup - Attach persistent disk


## Create `aio-builds` persistent disk (if not already exists)
- Follow instructions [here](https://cloud.google.com/compute/docs/disks/add-persistent-disk#create_disk).
- `sudo mkfs.ext4 -m 0 -E lazy_itable_init=0,lazy_journal_init=0,discard /dev/disk/by-id/google-aio-builds`


## Mount disk
- `sudo mkdir -p /mnt/disks/aio-builds`
- `sudo mount -o discard,defaults /dev/disk/by-id/google-aio-builds /mnt/disks/aio-builds`
- `sudo chmod a+w /mnt/disks/aio-builds`


## Mount disk on boot
- Run:
  ```sh
  echo UUID=`sudo blkid -s UUID -o value /dev/disk/by-id/google-aio-builds` \
    /mnt/disks/aio-builds ext4 defaults,discard,nofail 0 2 | sudo tee -a /etc/fstab
  ```
