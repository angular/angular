#!/usr/bin/env bash
(    
    cd $(dirname $0)
    echo "digraph {"
    echo "rankdir=RL; splines=ortho; node [shape=box];"
    jq -f org_chart.jq --raw-output < ../../content/marketing/contributors.json
    echo "}"
) | dot -Tpng > org.png