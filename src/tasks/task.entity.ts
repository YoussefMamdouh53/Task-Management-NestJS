import { BaseEntity, Column, CreateDateColumn, Entity, ManyToOne, PrimaryGeneratedColumn } from "typeorm";
import { TaskStatus } from "./task-status.enum";
import { User } from "src/auth/user.entity";

@Entity({name: 'tasks'})
export class Task extends BaseEntity {
    @PrimaryGeneratedColumn()
    id: number;

    @Column()
    title: string;

    @Column()
    description: string;

    @Column()
    status: TaskStatus;

    @CreateDateColumn()
    created_at: Date;

    @Column({ type: 'timestamptz' })
    due_date: Date;

    @ManyToOne(type => User, user => user.tasks, {eager:false})
    user: User;
}