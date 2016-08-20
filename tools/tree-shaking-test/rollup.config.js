class RollupNG2 {
  resolveId(id, from) {
    if (id.startsWith('@angular/')) {
      return `${process.env.BINDIR}/modules/@angular/${id.split('/')[1]}/esm/index.js`;
    }
  }
}


export default {
  format: 'es',
  plugins: [
    new RollupNG2(),
  ]
}
