import * as AuthCookie from 'hapi-auth-cookie';
import * as Bell from 'bell';
import * as Boom from 'boom';
import * as Hapi from 'hapi';
import * as Inert from 'inert';
import * as OAuthConfiguration from './configurations/index';
import * as Path from 'path';
import * as Tasks from './tasks';
import * as Users from './users';
import { IDatabase } from './database';
import { IPlugin } from './plugins/interfaces';
import { IServerConfigurations } from './configurations';
import { error } from 'util';
import { Server } from 'hapi';

export function init(configs: IServerConfigurations, database: IDatabase): Promise<Hapi.Server> {
    const oauthConfiguration = OAuthConfiguration.getOAuthConfigs();

    return new Promise<Hapi.Server>(resolve => {

        const port = process.env.PORT || configs.port;
        const server = new Hapi.Server();

        server.connection({
            port,
            routes: {
                cors: true
            }
        });

        // server.state('session', {  
        //     ttl: 1000 * 60 * 60 * 24,    // 1 day lifetime
        //     encoding: 'base64json'       // cookie data is JSON-stringified and Base64 encoded
        //   });

        if (configs.routePrefix) {
            server.realm.modifiers.route.prefix = configs.routePrefix;
        }

        //  Setup Hapi Plugins
        const plugins: string[] = configs.plugins;
        const pluginOptions = {
            database,
            serverConfigs: configs
        };

        const attribute = {
            name: 'authentication',
            version: '1.0.0'
        };

        const pluginPromises = [];
        pluginPromises.push(server.register(Inert));
        pluginPromises.push(server.register(Bell));
        // pluginPromises.push(server.register(AuthCookie));
        // server.register({ register: AuthCookie });

        // server.register(AuthCookie);
        // pluginPromises.push(server.register({
        //    register: AuthCookie,
        //    attributes: {
        //         name: 'authentication',
        //         version: '8.0.0'
        //     }
        // }));

        // server.register(require('./plugins/hapi-auth-cookie/index'));

        plugins.forEach((pluginName: string) => {
            const plugin: IPlugin = (require(`./plugins/${pluginName}`)).default();
            console.log(`Register Plugin ${plugin.info().name} v${plugin.info().version}`);
            pluginPromises.push(plugin.register(server, pluginOptions));
        });

        Promise.all(pluginPromises).then(() => {

            const authCookieOptions = {
                password: 'cookie-encryption-password', // Password used for encryption
                cookie: 'my-auth', // Name of cookie to set
                redirectTo: '/login',
                isSecure: false,
            };

            console.log('All plugins registered successfully.');

            // server.auth.strategy('my-cookie', 'cookie', authCookieOptions);

            server.auth.strategy('azure-oidc', 'bell', {
                provider: 'azuread',
                password: 'cookie_encryption_password_secure',
                clientId: oauthConfiguration.applicationId,
                clientSecret: oauthConfiguration.clientSecret,
                isSecure: false,
                providerParams: {
                    response_type: 'id_token',
                },
                scope: ['openid', 'offline_access', 'profile'],
                ttl: 1000 * 60 * 2
            });

            server.route({
                method: 'GET',
                path: '/{param*}',
                handler: {
                    directory: {
                        path: Path.join(__dirname, 'public'),
                        redirectToSlash: true,
                        listing: true,
                        index: ['index.html', 'default.html'],
                    },
                },
            });

            // server.auth.default('session');

            console.log('Register Routes');

            Tasks.init(server, configs, database);
            Users.init(server, configs, database);
            console.log('Routes registered successfully.');
            resolve(server);
        });
    });
}

