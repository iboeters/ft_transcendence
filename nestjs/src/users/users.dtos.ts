import { IsNotEmpty } from "class-validator";
import { uniqueUser } from './uniqueUser';

export class CreateUserDto {
	@IsNotEmpty()
	// @uniqueUser({message: 'Username already exists. Choose another name.'})
	// TODO: add more validation: no special characters etc.
	username: string;

	@IsNotEmpty()
	intraName: string;

	isActive: boolean;

	isTfaEnabled: boolean;
}
