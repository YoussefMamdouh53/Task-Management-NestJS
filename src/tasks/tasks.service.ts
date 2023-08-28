import { Injectable, InternalServerErrorException, Logger, NotFoundException } from '@nestjs/common';
import { CreateTaskDto } from './dto/create-task.dto';
import { UpdateTaskStatusDto } from './dto/update-task-status.dto';
import { GetTasksFilterDto } from './dto/get-tasks-filter.dto';
import { InjectRepository } from '@nestjs/typeorm';
import { Task } from './task.entity';
import { TaskStatus } from './task-status.enum';
import { Repository } from 'typeorm';
import { User } from 'src/auth/user.entity';

@Injectable()
export class TasksService {
  private readonly logger = new Logger('TaskService');
  constructor(
    @InjectRepository(Task) private readonly taskRepo: Repository<Task>,
  ) {}

  async getTasks(filterDto: GetTasksFilterDto, user: User): Promise<Task[]> {
    const { status, search } = filterDto;
    const query = this.taskRepo.createQueryBuilder('task');
    if (status) {
      query.andWhere('task.status = :status', { status });
    }
    if (status) {
      query.andWhere(
        'task.title LIKE :search OR task.description LIKE :search',
        { search: `%${search}%` },
      );
    }
    query.andWhere('task.userId = :user', { user: user.id });
    try {
      const tasks = await query.getMany();
      return tasks;
    } catch (err) {
      this.logger.error(`Failed to fetch all tasks for ${JSON.stringify({...filterDto})}`, err);
      throw new InternalServerErrorException();
    }
  }

  async getTaskById(id: number, user: User): Promise<Task> {
    const query = this.taskRepo
      .createQueryBuilder('task')
      .where('task.id = :id AND task.userId = :userid', {
        id,
        userid: user.id,
      });
    const task = await query.getOne();
    if (!task) {
      this.logger.error(`Failed to get task with id: ${id} for username "${user.username}"`);
      throw new NotFoundException(`no task found with ID ${id}`);
    }
    return task;
  }

  async createTask(createTaskDto: CreateTaskDto, user: User): Promise<Task> {
    const { title, description, due_date } = createTaskDto;
    const task = new Task();
    task.title = title;
    task.description = description;
    task.status = TaskStatus.OPEN;
    task.due_date = new Date(due_date);
    task.user = user;
    try {
      return await task.save();
    } catch (err) {
      this.logger.error(`Failed to create task ${JSON.stringify(createTaskDto)} for username "${user.username}"`,err);
      throw new InternalServerErrorException();
    }
  }

  async deleteTaskById(id: number, user: User): Promise<void> {
    const query = this.taskRepo
      .createQueryBuilder('task')
      .delete()
      .from(Task)
      .where('id = :id AND userId = :userid', {
        id,
        userid: user.id,
      });
    const result = await query.execute();
    if (result.affected === 0) {
      this.logger.error(`username: "${JSON.stringify(user.username)}:" no task deleted for ID ${id}`); 
      throw new NotFoundException(`no task found with ID ${id}`);
    }
  }

  async updateTaskStatus(
    id: number,
    updateTaskStatusDto: UpdateTaskStatusDto,
    user: User,
  ): Promise<Task> {
    const task = await this.getTaskById(id, user);
    task.status = updateTaskStatusDto.status;
    try {
      await task.save();
      return task;
    } catch (err) {
      this.logger.error(`failed to update task status with id ${id} and value ${JSON.stringify(updateTaskStatusDto)}`,err)
      throw new InternalServerErrorException();
    }
  }
}
