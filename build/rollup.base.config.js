import babel from '@rollup/plugin-babel'
import commonjs from '@rollup/plugin-commonjs'
import json from '@rollup/plugin-json'
import resolve from '@rollup/plugin-node-resolve'
import typescript from '@rollup/plugin-typescript'
import { defineConfig } from 'rollup'
import del from 'rollup-plugin-delete'
import dts from 'rollup-plugin-dts'
import eslint from 'rollup-plugin-eslint2'

const extensions = ['.ts', '.tsx', '.js', '.jsx', '.json']
const plugins = [
  eslint({
    include: 'src/**',
  }),
  json(),
  commonjs(),
  resolve({
    extensions,
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
    {
      input: 'src/index.ts',
      external,
      plugins,
      output: [
        {
          file: pkg.module,
          format: 'esm',
        },
        {
          file: pkg.main,
          format: 'cjs',
          exports: 'auto',
        },
      ],
    },
    // dts
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
