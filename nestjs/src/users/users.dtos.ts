import { IsNotEmpty } from "class-validator";
import { uniqueUser } from './uniqueUser';

export enum userStatus {
	Online = "online",
	Offline = "offline",
	InGame = "inGame",
}
export class CreateUserDto {
	@IsNotEmpty()
	// @uniqueUser({message: 'Username already exists. Choose another name.'})
	// TODO: add more validation: no special characters etc.
	username: string;

	@IsNotEmpty()
	intraName: string;

	status: userStatus;

	isTfaEnabled: boolean;
}
