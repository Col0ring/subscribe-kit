import babel from '@rollup/plugin-babel'
import commonjs from '@rollup/plugin-commonjs'
import json from '@rollup/plugin-json'
import resolve from '@rollup/plugin-node-resolve'
import typescript from '@rollup/plugin-typescript'
import { defineConfig } from 'rollup'
import del from 'rollup-plugin-delete'
import dts from 'rollup-plugin-dts'
import eslint from 'rollup-plugin-eslint2'
import { terser } from 'rollup-plugin-terser'

const extensions = ['.ts', '.tsx', '.js', '.jsx', '.json']
const plugins = [
  json(),
  commonjs(),
  resolve({
    extensions,
  }),
  eslint({
    include: 'src/**',
  }),
  babel({
    presets: [
      [
        '@babel/preset-env',
        {
          modules: false,
        },
      ],
    ],
    plugins: [
      [
        '@babel/plugin-transform-runtime',
        {
          useESModules: false,
        },
      ],
    ],
    extensions,
    exclude: /node_modules/,
    babelHelpers: 'runtime',
  }),
  typescript({
    tsconfig: './tsconfig.build.json',
  }),
  terser(),
  // 删除目录
  del({
    targets: 'dist',
  }),
]

export function createBaseConfig(pkg) {
  const external = [
    ...Object.keys(pkg.dependencies || {}),
    ...Object.keys(pkg.devDependencies || {}),
  ]

  return defineConfig([
    // dts
    {
      input: 'src/index.ts',
      external,
      plugins,
      output: [
        {
          file: pkg.module,
          format: 'esm',
          sourcemap: true,
        },
        {
          file: pkg.main,
          format: 'cjs',
          exports: 'auto',
          sourcemap: true,
        },
      ],
    },
    {
      input: 'src/index.ts',
      external,
      output: [
        {
          file: pkg.typings,
          format: 'es',
        },
      ],
      plugins: [dts()],
    },
  ])
}
