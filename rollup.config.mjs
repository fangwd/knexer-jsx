import resolve from '@rollup/plugin-node-resolve';
import commonjs from '@rollup/plugin-commonjs';
import typescript from '@rollup/plugin-typescript';
import babel from '@rollup/plugin-babel';
import terser from '@rollup/plugin-terser';

export default {
  input: 'src/index.ts',
  output: [
    {
      file: 'dist/knexer.js',
    }
  ],
  plugins: [
    resolve(),
    typescript({
      module: "esnext",
      outDir: 'dist',
    }),
    commonjs({
      include: ['src/*.ts*'],
    }),
    babel({
      exclude: 'node_modules/**',
      plugins: ['@babel/plugin-transform-react-jsx'],
    }),
    process.env.NODE_ENV === 'production' &&
    terser({
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
          ],
        },
      },
    }),
  ],
};
