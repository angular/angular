#!/usr/bin/env bash
(    
    cd $(dirname $0)
    echo "digraph {"
    jq -f org_chart.jq --raw-output < ../../content/marketing/contributors.json
    echo "}"
) | dot -Tpng > org.png