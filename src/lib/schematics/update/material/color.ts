import {bold, green, red} from 'chalk';

const colorFns = {
  'b': bold,
  'g': green,
  'r': red,
};

export function color(message: string): string {
  // 'r{{text}}' with red 'text', 'g{{text}}' with green 'text', and 'b{{text}}' with bold 'text'.
  return message.replace(/(.)\{\{(.*?)\}\}/g, (m, fnName, text) => {
    const fn = colorFns[fnName];
    return fn ? fn(text) : text;
  });
}
