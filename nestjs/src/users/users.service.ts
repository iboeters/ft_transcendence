import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { User } from 'src/typeorm';
import { Repository } from 'typeorm';
import { CreateUserDto } from 'src/users/users.dtos';

@Injectable()
export class UsersService {
	constructor(
		@InjectRepository(User) private readonly userRepository: Repository<User>,
	) {}

	createUser(createUserDto: CreateUserDto) {
		const newUser = this.userRepository.create(createUserDto);
		//console.log(createUserDto)
		return this.userRepository.save(newUser);
	}

	getUsers() {
		return this.userRepository.find();
	}

	findUsersById(id: number) {
		return this.userRepository.findOneBy({id: id});
	}
}