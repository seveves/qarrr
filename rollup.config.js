const typescript = require('rollup-plugin-typescript2');
const uglify = require('rollup-plugin-uglify');
const pkg = require('./package');
const umd = pkg['umd:main'];

export default {
  input: 'src/qarrr.ts',

  plugins: [
    typescript(),
    uglify()
  ],

  output: [
    { file: pkg.main, format: 'cjs' },
    { file: pkg.module, format: 'es' },
    { file: umd, format: 'umd', name: pkg.name },
  ]
}
