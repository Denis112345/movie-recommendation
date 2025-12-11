import { User } from "./entitys/user.entity";

export const UserProviders = [
    {
        provide: 'USERS_REPOSITORY',
        useValue: User
    }
]