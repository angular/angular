
const fs = require('fs');
const latest = JSON.parse(fs.readFileSync('/tmp/latest.log', 'utf8'));
const current = JSON.parse(fs.readFileSync('/tmp/current.log', 'utf8'));

let failed = false;
for (let commit in latest) {
  if (typeof latest[commit] === 'object') {
    for (let compressionType in latest[commit]) {
      if (typeof latest[commit][compressionType] === 'object') {
        for (let file in latest[commit][compressionType]) {
          const name = `${compressionType}/${file}`;
          const number = latest[commit][compressionType][file];
          if (current[name] - number > number / 100) {
            console.log(`Commit ${commit} ${compressionType} ${file} increase from ${number} to ${current[name]}`);
            failed = true;
          }
        }
      }
    }
  }
}

if (failed) {
  process.exit(1);
} else {
  console.log(`Payload size 1% check okay`);
}
