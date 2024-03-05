import { UserRole } from "src/userRole/userRole.entity";

export interface UserBody {
	name: string;
	email: string;
	surname: string;
	phone: string;
	dateOfBirth: string;
	residenceCity: string;
}

export interface CreateUserInterface extends UserBody{
	password: string;
	role: UserRole
}


export interface UserInterface {
	id: string;
	name: string;
	email: string;
	password: string;
	status: UserStatus;
	roles: UserRole[];
}

export enum UserStatus {
	ON_CHECK = 0,
	ACTIVE = 1,
	INACTIVE = 2,
	DELETED = 3
}
