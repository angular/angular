const babel = require('@babel/core');

const reproduce = true;

const res = babel.transformSync(
  `

const variableNeeded = true;

class X {

    x = true;

    constructor() {
        console.log("Constructed");
    }

    someMethod() {
        console.log("Some method");
    }

    static b = true;

    static {
      this.a = true;
    }
}

const el = document.createElement('span');
el.innerText = 'Hello';
document.body.appendChild(el);
`,
  {
    plugins: [['@babel/plugin-proposal-class-properties', {}]],
    presets: [
      [
        require('@babel/preset-env').default,
        {
          bugfixes: true,
          modules: false,
          targets: [
            'last 1 Chrome version',
            'last 1 Firefox version',
            'last 2 Edge major versions',
            ...(reproduce ? ['last 2 Safari major versions'] : []),
            ...(reproduce ? ['last 2 iOS major versions'] : []),
            'Firefox ESR',
          ],
          exclude: ['transform-typeof-symbol'],
        },
      ],
    ],
  }
);

console.error(res.code);
