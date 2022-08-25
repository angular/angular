# Miscellaneous - Use Let's Encrypt TLS certificates


[Let's Encrypt](https://letsencrypt.org/) is a free, automated, and open certificate authority (CA),
provided by the [Internet Security Research Group (ISRG)](https://www.abetterinternet.org/). It can
be used for issuing the certificates needed by the preview server. See the "Create TLS certificates"
section in [this doc](vm-setup--create-host-dirs-and-files.md) for more details.

Let's Encrypt supports issuing
[wildcard certificates](https://letsencrypt.org/docs/faq/#does-let-s-encrypt-issue-wildcard-certificates),
but they have to be renewed every 3 months using a
[DNS-01 challenge](https://letsencrypt.org/docs/challenge-types/#dns-01-challenge).

Below are instructions for the creation of certificates using Let's Encrypt.

**Note 1:**
  It is assumed that the commands are executed on the VM that hosts the preview server. You can run
  the commands on any machine and adjust accordingly the steps for transfering the generated
  certificate and private key to the preview server VM.

**Note 2:**
  In order to complete the DNS-01 challenge and generate the certificate, one needs to have access
  to update the DNS records associated with the `ngbuilds.io` domain and subdomains.


## Prerequisites
- Install [certbot](https://certbot.eff.org/):
  - Old method: `sudo apt-get install certbot`
  - New method: Follow the instructions [here](https://certbot.eff.org/instructions).


## Create new certificate
- Run the following command and follow the on-screen instructions:
  ```sh
  sudo certbot certonly \
    -d "ngbuilds.io,*.ngbuilds.io" \
    -m "devops@angular.io" \
    --agree-tos \
    --manual \
    --manual-public-ip-logging-ok \
    --preferred-challenges="dns"
  ```

  **Hint:**
    You can use `dig -t txt _acme-challenge.ngbuilds.io` (on Linux/macOS) or something like
    [DNSChecker.org](https://dnschecker.org/all-dns-records-of-domain.php?query=_acme-challenge.ngbuilds.io&rtype=TXT) to verify that the DNS updates have been successfully deployed and propagated.

- [Optional] Remove the DNS TXT records added in the previous step.
  (They are no longer needed, unless you want to create more certificates now.)


## Deploy new certificate
- Copy files to the host machine's `/etc/ssl/localcerts` directory, replacing `YYYY-MM` in the file
  names with the current year and month (for example, `2022-08`):
  ```sh
  # Copy certificate.
  sudo cp /etc/letsencrypt/live/ngbuilds.io/fullchain.pem /etc/ssl/localcerts/ngbuilds.io.crt.YYYY-MM
  sudo cp /etc/letsencrypt/live/ngbuilds.io/fullchain.pem /etc/ssl/localcerts/ngbuilds.io.crt

  # Copy private key.
  sudo cp /etc/letsencrypt/live/ngbuilds.io/privkey.pem /etc/ssl/localcerts/ngbuilds.io.key.YYYY-MM
  sudo cp /etc/letsencrypt/live/ngbuilds.io/privkey.pem /etc/ssl/localcerts/ngbuilds.io.key

  # Update permissions.
  sudo find /etc/ssl/localcerts -type f -exec chmod 400 {} \;
  ```

  **Note:**
    The `.YYYY-MM`-suffixed copies are not needed/used. They are just kept for reference and backup
    purposes.

- Reload `nginx`:
  ```sh
  # Connect to the Docker container and reload reload `nginx`.
  sudo docker exec -it aio service nginx reload
  ```

- [Optional] Verify that the certificate has been successfully deployed by visiting
  https://ngbuilds.io/ in a browser and inspecting the TLS certificate details. See, for example,
  [how to view certificate details in Chrome](https://www.howtogeek.com/292076/how-do-you-view-ssl-certificate-details-in-google-chrome/).
