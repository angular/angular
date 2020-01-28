# Shortcuts to set output as bold and normal
bold=$(tput bold)
normal=$(tput sgr0)

# Package being tested for turnaround time.
test_package="//packages/core/test/acceptance:acceptance"
# Bazel test command
test_command="yarn -s bazel test ${test_package} --config=ivy > /dev/null 2>&1"
echo "Testing ${test_package}"

# Set up a clean bazel environment
echo "Running bazel clean and restart bazel server"
yarn -s bazel clean --expunge > /dev/null 2>&1
# call bazel info to start bazel server
yarn -s bazel info > /dev/null 2>&1

# Perform initial build/test to fill the cache
echo "Testing acceptance target"
first_run=$(/usr/bin/time -f "%e" sh -c "$test_command" 2>&1 1>/dev/null)
echo "  Initial build time: ${bold}$first_run seconds${normal}"

# Make a change to invalidate cache
echo "Adding empty new line to attributes_spec.ts file"
echo "console.log('hello');" >> ../../packages/core/test/acceptance/attributes_spec.ts

# Perform test again to determine turn around time.
echo "Testing acceptance target"
second_run=$(/usr/bin/time -f "%e" sh -c "$test_command" 2>&1 1>/dev/null)
echo "  TDD turn around time: ${bold}$second_run seconds${normal}"
