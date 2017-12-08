import * as Hapi from 'hapi';
import * as Joi from 'joi';
import UserController from './user-controller';
import { UserModel } from './user';
import * as UserValidator from './user-validator';
import { IDatabase } from '../database';
import { IServerConfigurations } from '../configurations';
import * as Bell from 'bell';
import * as OAuthConfiguration from '../configurations/index'; 

export default function (server: Hapi.Server, serverConfigs: IServerConfigurations, database: IDatabase) {
    const oauthConfiguration = OAuthConfiguration.getOAuthConfigs();  
    
    const userController = new UserController(serverConfigs, database);
    server.bind(userController);

    server.route({
        method: 'DELETE',
        path: '/users',
        config: {
            handler: userController.deleteUser,
            auth: 'jwt',
            tags: ['api', 'users'],
            description: 'Delete current user.',
            validate: {
                headers: UserValidator.jwtValidator
            },
            plugins: {
                'hapi-swagger': {
                    responses: {
                        '200': {
                            'description': 'User deleted.',
                        },
                        '401': {
                            'description': 'User does not have authorization.'
                        }
                    }
                }
            }
        }
    });  

    server.register(Bell);
    console.log('bell registered ');
    // server.register(Bell, () => {
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
    });

    console.log('auth strategy registered ');
    
    server.route({
        method: '*',
        path: '/login',
        config: {
            auth: {
                strategy: 'azure-oidc',
                mode: 'try',
            },
            handler: userController.loginUser,
            tags: ['api', 'user'],
            description: 'Get user info.',
            plugins: {
                'hapi-swagger': {
                    responses: {
                        '200': {
                            'description': 'User founded.',
                        },
                        '401': {
                            'description': 'Please login.',
                        },
                    },
                },
            },
        },
    });
}
