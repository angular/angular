import { Injectable } from '@angular/core';

const quotes = [
'Always do right. This will gratify some people and astonish the rest.',
'I have never let my schooling interfere with my education.',
'Don\'t go around saying the world owes you a living. The world owes you nothing. It was here first.',
'Whenever you find yourself on the side of the majority, it is time to pause and reflect.',
'If you tell the truth, you don\'t have to remember anything.',
'Clothes make the man. Naked people have little or no influence on society.',
'It\'s not the size of the dog in the fight, it\'s the size of the fight in the dog.',
'Truth is stranger than fiction, but it is because Fiction is obliged to stick to possibilities; Truth isn\'t.',
'The man who does not read good books has no advantage over the man who cannot read them.',
'Get your facts first, and then you can distort them as much as you please.',
];

@Injectable()
export class TwainService {
  private next = 0;

  // Imaginary todo: get quotes from a remote quote service
  // returns quote after delay simulating server latency
  getQuote(): Promise<string> {
    return new Promise(resolve => {
      setTimeout( () => resolve(this.nextQuote()), 500 );
    });
  }

  private nextQuote() {
    if (this.next === quotes.length) { this.next = 0; }
    return quotes[ this.next++ ];
  }
}
