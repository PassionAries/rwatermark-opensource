import { Injectable } from "@nestjs/common";
import * as fs from 'fs';
import * as _ from 'lodash';
export interface ModuleConfig {
    [key: string]: any;
  }
  
export interface Config {
    [key: string]: ModuleConfig;
}
export interface ConfigOptions  {
  nacos?:boolean,
  config_id?:string;
  inject?:any[]
}
  
@Injectable()
export class ConfigService {
    private static config: Config={}
     /**
         * @param {Config} config
         */
    constructor(config: Config = {}) {
        // this.bindCustomHelpers(config);
        ConfigService.config = config;
    }

    static async load(
        config_path: string,
        options?:ConfigOptions,
      ): Promise<ConfigService> {
        const configs = await this.loadConfigAsync(config_path, options);
        ConfigService.config = configs;
        return new ConfigService(configs);
      }
      protected static  async loadConfigAsync(config_path:string,options?:ConfigOptions){
        let config ={}; 
        if (fs.existsSync(config_path)) {
          console.log("existsSyncexistsSyncexistsSync");
          let configJSON=fs.readFileSync(config_path,'utf-8');
          config=JSON.parse(configJSON);
        }
        return config
      }
      load(){

      }
      static get(param: string | string[], value: any = undefined): any {
        const configValue = _.get(ConfigService.config, param);
        if (configValue === undefined) {
          return value;
        }
        return configValue;
      }
      static set(param: string | string[], value: any = null):Config{
        return _.set(ConfigService.config, param, value);
      }
      get<T = any>(param: string | string[], value: any = undefined): T {
        return ConfigService.get(param, value);
      }
      set(param: string | string[], value: any = null): Config {
        return _.set(ConfigService.config, param, value);
      }
//       /**
//    * @param {string | string[]} glob
//    * @param {DotenvOptions | false} options
//    * @returns {Promise<Config>}
//    */
//   protected static loadConfigAsync(
//     glob: string,
//     options?: ConfigOptions | false,
//   ): Promise<Config> {
//     glob = this.root(glob);
//     return new Promise((resolve, reject) => {
//       new Glob(glob, {}, (err, matches) => {
//         /* istanbul ignore if */
//         if (err) {
//           reject(err);
//         } else {
//           this.loadEnv(options);

//           const configs = this.configGraph(
//             matches,
//             options && options.modifyConfigName,
//           );

//           resolve(configs);
//         }
//       });
//     });
//   }
}