export function createElementAndAppend(parent: any, name: string) {
  const el = document.createElement(name);
  parent.appendChild(el);
  return el;
}

export function createTextAndAppend(parent: any) {
  const txt = document.createTextNode('');
  parent.appendChild(txt);
  return txt;
}

export function createAnchorAndAppend(parent: any) {
  const txt = document.createComment('');
  parent.appendChild(txt);
  return txt;
}