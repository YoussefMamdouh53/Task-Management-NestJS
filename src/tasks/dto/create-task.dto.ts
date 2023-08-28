import { Type } from 'class-transformer';
import {IsDate, IsEmail, IsNotEmpty, Length} from 'class-validator';

export class CreateTaskDto {
    @IsNotEmpty()
    @Length(5)
    title: string;

    @IsNotEmpty()
    @Length(10)
    description: string;

    @IsNotEmpty()
    @IsDate()
    @Type(() => Date)
    due_date: Date;
}