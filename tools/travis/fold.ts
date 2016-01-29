
function encode(str: string) {
  return str.replace(/\W/g, '-').replace(/-$/, '');
}

export function travisFoldStart(name: string): () => void {
  if (process.env['TRAVIS']) {
    console.log('travis_fold:start:' + encode(name));
  }

  return () => {
    if (process.env['TRAVIS']) {
      console.log('travis_fold:end:' + encode(name));
    }
  };
}
