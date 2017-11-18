
const fs = require('fs');
// Get branch and project name from command line arguments
const [, , limitFile, project, branch] = process.argv;

const limit = JSON.parse(fs.readFileSync(limitFile, 'utf8'));
const current = JSON.parse(fs.readFileSync('/tmp/current.log', 'utf8'));


const limitData = limit[project][branch] || limit[project]["master"];
  
if (!limitData) {
  console.error(`No limit data found.`);
  // If no payload limit file found, we don't need to check the size
  exit(0);
}

let failed = false;
for (let compressionType in limitData) {
  if (typeof limitData[compressionType] === 'object') {
    for (let file in limitData[compressionType]) {
      const name = `${compressionType}/${file}`;
      const number = limitData[compressionType][file];
      if (Math.abs(current[name] - number) > number / 100) {
        console.log(`Commit ${commit} ${compressionType} ${file} changed from ${number} to ${current[name]}.
            If this is a desired change, please update the payload size limits in file ${limitFile}`);
        failed = true;
      }
    }
  }
}

if (failed) {
  process.exit(1);
} else {
  console.log(`Payload size 1% check okay`);
}
