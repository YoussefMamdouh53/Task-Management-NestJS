import { ArgumentMetadata, BadRequestException, PipeTransform } from "@nestjs/common";
import { TaskStatus } from "../task-status.enum";

export class TaskStatusValidationPipe implements PipeTransform {

    transform(value: any, metadata: ArgumentMetadata) {
        value.status = value.status.toUpperCase();
        
        if (!Object.values(TaskStatus).includes(value.status)) {
            throw new BadRequestException("invalid status");
        }

        return value;
    }
}