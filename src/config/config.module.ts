import { DynamicModule, Module, Global } from '@nestjs/common';
import { ConfigOptions, ConfigService } from './config.service';

@Global()
@Module({})
export class ConfigModule {
  /**
   * @param startPath
   * @deprecated
   */
//   static resolveSrcPath(startPath: string): typeof ConfigModule {
//     ConfigService.resolveSrcPath(startPath);
//     return this;
//   }

//   /**
//    * @param path
//    */
//   public static resolveRootPath(path: string): typeof ConfigModule {
//     ConfigService.resolveRootPath(path);
//     return this;
//   }

  /**
   * From Glob
   * @param config_path
   * @param {ConfigOptions} options
   * @returns {DynamicModule}
   */
  static load(config_path: string, options?:ConfigOptions): DynamicModule {
    const configProvider = {
      provide: ConfigService,
      useFactory: async (): Promise<ConfigService> => {
        // ss.eryiOrder.findFirst
        // return null;
        return ConfigService.load(config_path, options);
      },
      inject:options?.inject||[]
    };
    return {
      module: ConfigModule,
      providers: [configProvider],
      exports: [configProvider],
    };
  }
}