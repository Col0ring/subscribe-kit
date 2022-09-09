import type { RollupOptions } from 'rollup'

interface PackageConfig {
  dependencies?: Record<string, string>
  devDependencies?: Record<string, string>
  module: string
  main: string
  typings: string
}

declare function createBaseConfig(pkg: PackageConfig): RollupOptions[]
