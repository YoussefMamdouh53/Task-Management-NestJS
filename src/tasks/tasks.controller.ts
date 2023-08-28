import {
  Controller,
  Get,
  Post,
  Body,
  Param,
  Delete,
  Patch,
  Query,
  ParseIntPipe,
  UseGuards,
  Logger,
} from '@nestjs/common';
import { TasksService } from './tasks.service';
import { CreateTaskDto } from './dto/create-task.dto';
import { UpdateTaskStatusDto } from './dto/update-task-status.dto';
import { GetTasksFilterDto } from './dto/get-tasks-filter.dto';
import { TaskStatusValidationPipe } from './pipes/task-status-validation.pipe';
import { Task } from './task.entity';
import { AuthGuard } from '@nestjs/passport';
import { GetUser } from 'src/auth/get-user.decorator';
import { User } from 'src/auth/user.entity';

@Controller('tasks')
@UseGuards(AuthGuard())
export class TasksController {
  private logger = new Logger('TasksController');
  constructor(private tasksService: TasksService) {}

  @Get()
  getTasks(@GetUser() user: User, @Query() filterDto: GetTasksFilterDto) {
    this.logger.verbose(`User "${user.username}" retrieving all tasks. Filters: ${JSON.stringify(filterDto)}`);
    return this.tasksService.getTasks(filterDto, user);
  }

  @Get('/:id')
  getTaskById(
    @GetUser() user: User,
    @Param('id', ParseIntPipe) id: number,
  ): Promise<Task> {
    this.logger.verbose(`User "${user.username}" retrieving task with ID ${id}`);
    return this.tasksService.getTaskById(id, user);
  }

  @Post()
  createTask(
    @GetUser() user: User,
    @Body() createTaskDto: CreateTaskDto,
  ): Promise<Task> {
    this.logger.verbose(`User "${user.username}" creating task with values ${JSON.stringify(createTaskDto)}`)
    return this.tasksService.createTask(createTaskDto, user);
  }

  @Delete('/:id')
  deleteTaskById(
    @GetUser() user: User,
    @Param('id', ParseIntPipe) id: number,
  ): void {
    this.logger.verbose(`User "${user.username}" deleting task with ID ${id}`);
    this.tasksService.deleteTaskById(id, user);
  }

  @Patch('/:id/status')
  UpdateTaskStatus(
    @GetUser() user: User,
    @Param('id', ParseIntPipe) id: number,
    @Body(TaskStatusValidationPipe) updateTaskStatusDto: UpdateTaskStatusDto,
  ) {
    this.logger.verbose(`User "${user.username}" updating task status task with ID ${id} to ${JSON.stringify(UpdateTaskStatusDto)}`);
    return this.tasksService.updateTaskStatus(id, updateTaskStatusDto, user);
  }
}
