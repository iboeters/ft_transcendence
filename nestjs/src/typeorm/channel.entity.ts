import { Entity, Column, PrimaryColumn, OneToMany, ManyToMany, JoinTable } from 'typeorm';
import { User } from './user.entity';
    
@Entity()
export class Channel {
    @PrimaryColumn({ unique: true })
    name: string;
    
    @Column()
    owner: number;

    @Column({ nullable: true })
    password: string;

    @Column()
    channelType: string;

    @ManyToMany(() => User)
    @JoinTable()
    members: User[]

    @ManyToMany(() => User)
    @JoinTable()
    admins: User[]
} 