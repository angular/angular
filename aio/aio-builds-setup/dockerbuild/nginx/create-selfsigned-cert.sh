#!/bin/bash
set -eu -o pipefail


# Variables
confFile=/tmp/$1.conf
domainName=$2
outDir=$3


# Create certificate
cp /etc/ssl/openssl.cnf "$confFile"
echo "[subjectAltName]" >> "$confFile"
echo "subjectAltName = DNS:$domainName, DNS:*.$domainName" >> "$confFile"
mkdir -p $outDir
openssl req -days 365 -newkey rsa:2048 -nodes -sha256 -x509 \
            -config "$confFile" -extensions subjectAltName -subj "/CN=$domainName" \
            -out "$outDir/$domainName.crt" -keyout "$outDir/$domainName.key"
chmod -R 400 "$outDir"
cp "$outDir/$domainName.crt" /usr/local/share/ca-certificates
