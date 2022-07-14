import { Entity, Column, PrimaryGeneratedColumn, CreateDateColumn, ManyToOne } from 'typeorm';
import { Channel } from './channel.entity';
    
@Entity()
   export class Message {
    @PrimaryGeneratedColumn()
    id: number;

    @Column()
    sender: number;

    @ManyToOne(() => Channel, (channel) => channel.messages)
    channel: string;
    
    @Column()
    text: string;

    @CreateDateColumn()
    date: Date;
}