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

    server.route({
        method: 'GET',
        path: '/login',
        config: {
            auth: {
                strategy: 'azure-oidc',
                mode: 'try',
            },
            cors: {
                origin: ['*'],
                headers: ['Origin', 'Content-Type', 'Accept', 'cache-control', 'x-requested-with'],
                exposedHeaders: ['Authorization']
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

    server.route({
        method: 'GET',
        path: '/isAuthenticated',
        config: {
            handler: userController.isAuthenticated,
            tags: ['api', 'users'],
            description: 'Delete current user.',
            validate: {
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
}
