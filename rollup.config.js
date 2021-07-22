import resolve from 'rollup-plugin-node-resolve';
import commonjs from 'rollup-plugin-commonjs';
import typescript from '@wessberg/rollup-plugin-ts';
import babel from 'rollup-plugin-babel';
import { uglify } from 'rollup-plugin-uglify';
import * as domprops from 'uglify-js/tools/domprops.json';

export default {
  input: 'src/index.ts',
  output: [
    {
      file: 'dist/knexer.js',
      format: 'cjs',
    },
    {
      file: 'dist/knexer.min.js',
      format: 'iife',
      name: 'knexer',
    },
  ],
  plugins: [
    resolve(),
    typescript(),
    commonjs({
      include: ['src/*.ts*'],
    }),
    babel({
      exclude: 'node_modules/**',
      plugins: ['@babel/plugin-transform-react-jsx'],
    }),
    process.env.NODE_ENV === 'production' &&
      uglify({
        mangle: {
          properties: {
            builtins: false,
            reserved: [
              'h',
              'mount',
              'destroy',
              'key',
              'ref',
              'useState',
              'useEffect',
              'useRef',
              'useMemo',
              '__html',
              ...domprops,
            ],
          },
        },
      }),
  ],
};
