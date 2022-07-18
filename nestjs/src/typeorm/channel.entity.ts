import { Entity, Column, PrimaryColumn, OneToMany } from 'typeorm';
import { Message } from './message.entity';
    
@Entity()
export class Channel {
    @PrimaryColumn({ unique: true })
    name: string;
    
    @Column()
    owner: number;

    @Column("int", { array: true })
    admins: number[];

    @Column("int", { array: true })
    members: number[];

    // @OneToMany(() => Message, (message: Message) => message.channel)
    // messages: Message[]
}