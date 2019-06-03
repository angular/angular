#!/usr/bin/env bash
#
# Reads the contributors.json file and tries to fill in missing data from other sources.

readonly MISSING_PICTURE_QUERY='with_entries(select(.value | has("picture") | not)) | keys[]'
readonly MISSING_BIO_QUERY='with_entries(select(.value | has("bio") | not)) | keys[]'

(    
    cd $(dirname $0)/../../content/marketing

    for handle in $(jq "$MISSING_PICTURE_QUERY" --raw-output < contributors.json); do
      avatar_url=$(curl --silent -H "Authorization: token ${TOKEN}" https://api.github.com/users/$handle \
        | jq ".avatar_url" --raw-output)
      echo "Missing picture for $handle, downloading it from $avatar_url"
      curl -o ../images/bios/$handle.jpg $avatar_url
      newjson=$(mktemp)
      jq ".\"$handle\".picture |= \"$handle.jpg\"" < contributors.json > $newjson
      mv $newjson contributors.json
    done

    for handle in $(jq "$MISSING_BIO_QUERY" --raw-output < contributors.json); do
      bio=$(curl --silent -H "Authorization: token ${TOKEN}" https://api.github.com/users/$handle \
        | jq ".bio|tojson" --raw-output)
      if [[ "$bio" != "null" ]]; then
        echo "Missing bio for $handle, using \"$bio\""
      
        newjson=$(mktemp)
        jq ".\"$handle\".bio |= \"$bio\"" < contributors.json > $newjson
        mv $newjson contributors.json
      fi
    done
)
