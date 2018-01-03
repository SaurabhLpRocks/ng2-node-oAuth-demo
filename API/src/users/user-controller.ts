import * as Hapi from 'hapi';
import * as Boom from 'boom';
import * as Jwt from 'jsonwebtoken';
import { IUser } from './user';
import { IDatabase } from '../database';
import { IServerConfigurations } from '../configurations';


export default class UserController {

    private database: IDatabase;
    private configs: IServerConfigurations;

    constructor(configs: IServerConfigurations, database: IDatabase) {
        this.database = database;
        this.configs = configs;
    }

    private generateToken(user: IUser) {
        const jwtSecret = this.configs.jwtSecret;
        const jwtExpiration = this.configs.jwtExpiration;
        const payload = { id: user.name };

        return Jwt.sign(payload, jwtSecret, { expiresIn: jwtExpiration });
    }

    async createUser(request: Hapi.Request, reply: Hapi.ReplyNoContinue) {
        try {
          const user: any = await this.database.userModel.create(request.payload);
            return reply({ token: this.generateToken(user)}).code(201);
        } catch (error) {
            return reply(Boom.badImplementation(error));
        }
    }

    async updateUser(request: Hapi.Request, reply: Hapi.ReplyNoContinue) {
        const id = request.auth.credentials.id;

        try {
          const  user: IUser = await this.database.userModel.findByIdAndUpdate(id, { $set: request.payload }, { new: true });
            return reply(user);
        } catch (error) {
            return reply(Boom.badImplementation(error));
        }
    }

    async deleteUser(request: Hapi.Request, reply: Hapi.ReplyNoContinue) {
        const id = request.auth.credentials.id;
        const user: IUser = await this.database.userModel.findByIdAndRemove(id);

        return reply(user);
    }

    async infoUser(request: Hapi.Request, reply: Hapi.ReplyNoContinue) {
        const id = request.auth.credentials.id;
        const user: IUser = await this.database.userModel.findById(id);

        reply(user);
    }

    async loginUser(request: Hapi.Request, reply: Hapi.ReplyNoContinue) {
           
        if (!request.auth.isAuthenticated) {
          return reply(Boom.unauthorized(request.auth.error.message));
        }
    
        return reply.response({
                                token: this.generateToken(request.auth.credentials.profile),
                                roleIds: ['2'],
                                roleNames: ['Admin'],
                                firstName: request.auth.credentials.profile.given_name,
                                lastName:  request.auth.credentials.profile.family_name,
                                userName: request.auth.credentials.profile.email,
                                email: request.auth.credentials.profile.email,
                                userId: request.auth.credentials.profile.email,
                              }).redirect('http://localhost:5000/app');
      }

      async isAuthenticated(request: Hapi.Request, reply: Hapi.ReplyNoContinue) {
        if (!request.auth.isAuthenticated) {
            return reply(Boom.unauthorized(request.auth.error.message));
          }
      
          return reply.response({
                                  token: this.generateToken(request.auth.credentials.profile),
                                  roleIds: ['2'],
                                  roleNames: ['Admin'],
                                  firstName: request.auth.credentials.profile.given_name,
                                  lastName:  request.auth.credentials.profile.family_name,
                                  userName: request.auth.credentials.profile.email,
                                  email: request.auth.credentials.profile.email,
                                  userId: request.auth.credentials.profile.email,
                                }).redirect('http://google.com');
      }
    
}
