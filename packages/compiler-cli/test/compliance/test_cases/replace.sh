#!/bin/bash

# Step 1: Find all .pipeline.js files recursively
find . -type f -name "*.pipeline.js" | while read -r pipeline_file; do
    base_dir=$(dirname "$pipeline_file")
    base_name=$(basename "$pipeline_file" .pipeline.js)

    # Step 2: Attempt to delete the corresponding .js, .template.js, or _template.js file
    js_file="${base_dir}/${base_name}.js"
    template_js_file="${base_dir}/${base_name}.template.js"
    underscore_template_js_file="${base_dir}/${base_name}_template.js"

    file_deleted=false

    if [ -f "$js_file" ]; then
        rm "$js_file" && echo "Deleted file: $js_file"
        file_deleted=true
    fi
    if [ -f "$template_js_file" ]; then
        rm "$template_js_file" && echo "Deleted file: $template_js_file"
        file_deleted=true
    fi
    if [ -f "$underscore_template_js_file" ]; then
        rm "$underscore_template_js_file" && echo "Deleted file: $underscore_template_js_file"
        file_deleted=true
    fi

    if [ "$file_deleted" = false ]; then
        echo "Error: Corresponding file for $pipeline_file not found."
    fi

    # Step 3: Modify TEST_CASES.json if it exists in the same directory
    test_cases_file="${base_dir}/TEST_CASES.json"
    if [ -f "$test_cases_file" ]; then
        # Patterns to match "expected" before the filename
        js_pattern="expected.*$base_name\.js"
        template_js_pattern="expected.*$base_name\.template\.js"
        underscore_template_js_pattern="expected.*$base_name\_template\.js"

        # Use a more compatible sed in-place editing command
        if grep -q -E "expected.*(js|template\.js|_template\.js)" "$test_cases_file"; then
            # Determine if we are using GNU sed or BSD sed and adjust the command accordingly
            if sed --version 2>/dev/null | grep -q GNU; then
                # GNU sed
                sed -i "/$js_pattern/d" "$test_cases_file"
                sed -i "/$template_js_pattern/d" "$test_cases_file"
                sed -i "/$underscore_template_js_pattern/d" "$test_cases_file"
            else
                # BSD sed
                sed -i '' "/$js_pattern/d" "$test_cases_file"
                sed -i '' "/$template_js_pattern/d" "$test_cases_file"
                sed -i '' "/$underscore_template_js_pattern/d" "$test_cases_file"
            fi
            echo "Modified $test_cases_file to remove references to ${base_name}.js, ${base_name}.template.js, and/or ${base_name}_template.js with 'expected' preceding"
        else
            echo "Error: No line found in $test_cases_file for 'expected' preceding ${base_name}.js, ${base_name}.template.js, or ${base_name}_template.js"
        fi
    else
        echo "Error: TEST_CASES.json not found in $base_dir"
    fi
done
