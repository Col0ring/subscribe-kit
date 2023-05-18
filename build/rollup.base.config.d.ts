import type { RollupOptions } from 'rollup'

export interface PackageConfig {
  dependencies?: Record<string, string>
  devDependencies?: Record<string, string>
  publishConfig: {
    module: string
    main: string
    typings: string
  }
}

export declare function createBaseConfig(pkg: PackageConfig): RollupOptions[]
