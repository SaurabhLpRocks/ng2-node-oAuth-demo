import * as Hapi from 'hapi';
import * as Boom from 'boom';
import { IPlugin } from './plugins/interfaces';
import { IServerConfigurations } from './configurations';
import * as Tasks from './tasks';
import * as Users from './users';
import { IDatabase } from './database';
import * as Bell from 'bell'; 
import * as Inert from 'inert'; 
import * as Path from 'path'; 

export function init(configs: IServerConfigurations, database: IDatabase): Promise<Hapi.Server> {

    return new Promise<Hapi.Server>(resolve => {

        const port = process.env.PORT || configs.port;
        const server = new Hapi.Server();

        server.connection({
            port,
            routes: {
                cors: true
            }
        });

        if (configs.routePrefix) {
            server.realm.modifiers.route.prefix = configs.routePrefix;
        }

        //  Setup Hapi Plugins
        const plugins: string[] = configs.plugins;
        const pluginOptions = {
            database,
            serverConfigs: configs
        };

        const pluginPromises = [];

        plugins.forEach((pluginName: string) => {
          const plugin: IPlugin = (require(`./plugins/${pluginName}`)).default();
            console.log(`Register Plugin ${plugin.info().name} v${plugin.info().version}`);
            pluginPromises.push(plugin.register(server, pluginOptions));
        });

        server.register(Inert); 
        
        //    server.route({  
        //      method: 'GET',  
        //      path: '/{login*}',  
        //      handler: {  
        //       directory: { 
        //         path: Path.join( __dirname, 'public'), 
        //        //  listing: true, 
        //       }, 
        //      },  
        //    });    

        Promise.all(pluginPromises).then(() => {
            console.log('All plugins registered successfully.');

            console.log('Register Routes');
            Tasks.init(server, configs, database);
            Users.init(server, configs, database);
            console.log('Routes registered successfully.');

            resolve(server);
        });
    });
}
