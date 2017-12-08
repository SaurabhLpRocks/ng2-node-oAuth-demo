import * as Hapi from 'hapi';
import * as Boom from 'boom';
import { ITask } from './task';
import { IDatabase } from '../database';
import { IServerConfigurations } from '../configurations';

export default class TaskController {

    private database: IDatabase;
    private configs: IServerConfigurations;

    constructor(configs: IServerConfigurations, database: IDatabase) {
        this.configs = configs;
        this.database = database;
    }

    async createTask(request: Hapi.Request, reply: Hapi.ReplyNoContinue) {
        const userId = request.auth.credentials.id;
        const newTask: ITask = request.payload;
        newTask.userId = userId;

        try {
            const task: ITask = await this.database.taskModel.create(newTask);
            return reply(task).code(201);
        } catch (error) {
            return reply(Boom.badImplementation(error));
        }
    }

    async updateTask(request: Hapi.Request, reply: Hapi.ReplyNoContinue) {
      const userId = request.auth.credentials.id;
      const id = request.params['id'];

        try {
            const task: ITask = await this.database.taskModel.findByIdAndUpdate(
                { _id: id, userId },
                { $set: request.payload },
                { new: true }
            );

            if (task) {
                reply(task);
            } else {
                reply(Boom.notFound());
            }

        } catch (error) {
            return reply(Boom.badImplementation(error));
        }
    }

    async deleteTask(request: Hapi.Request, reply: Hapi.ReplyNoContinue) {
      const id = request.params['id'];
      const userId = request.auth.credentials.id;

      const deletedTask = await this.database.taskModel.findOneAndRemove({ _id: id, userId });

        if (deletedTask) {
            return reply(deletedTask);
        } else {
            return reply(Boom.notFound());
        }
    }

    async getTaskById(request: Hapi.Request, reply: Hapi.ReplyNoContinue) {
        const userId = request.auth.credentials.id;
        const id = request.params['id'];

        const task = await this.database.taskModel.findOne({ _id: id, userId }).lean(true);

        if (task) {
            reply(task);
        } else {
            reply(Boom.notFound());
        }
    }

    async getTasks(request: Hapi.Request, reply: Hapi.ReplyNoContinue) {
        const userId = request.auth.credentials.id;
        const top = request.query['top'];
        const skip = request.query['skip'];
        const tasks = await this.database.taskModel.find({ userId }).lean(true).skip(skip).limit(top);

        return reply(tasks);
    }
}
