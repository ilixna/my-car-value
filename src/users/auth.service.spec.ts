import { BadRequestException, NotFoundException } from "@nestjs/common";
import { Test } from "@nestjs/testing";
import { AuthService } from "./auth.service";
import { User } from "./user.entity";
import { UsersService } from "./users.service";

describe('AuthService', () => {

    let service: AuthService;
    let fakeUsersService: Partial<UsersService>;

    beforeEach( async () => {
        // Create a fake copy of the users service
        const users: User[] = [];
        fakeUsersService = {
            find: (email) => {
                const filteredUsers = users.filter(user => user.email === email);
                return Promise.resolve(filteredUsers);
            },
            create: (email: string, password: string) => {
                const user = {id: Math.floor(Math.random()*999999), email, password} as User;
                users.push(user);
                return Promise.resolve(user);
            }
        }

        const module = await Test.createTestingModule({
            providers: [AuthService, {provide: UsersService, useValue: fakeUsersService}]
        }).compile();

        service = module.get(AuthService);
    })



    it('Can create an instance of auth service', async () => {
        expect(service).toBeDefined();
    });

    it('Creates a new user with a salted and hashed password', async () => {
        const user = await service.signup('olo@olo.com', '321');
        expect(user.password).not.toEqual('321');
        const [salt, hash] = user.password.split('.');
        expect(salt).toBeDefined();
        expect(hash).toBeDefined();
    });

    it('Throws an error if user signs up with email that is in use', async () => {
        await service.signup("asdf@asdf.com", "asdf");
        await expect(service.signup("asdf@asdf.com", "asdf")).rejects.toThrow(BadRequestException);
    });

    it('Throws if signin is called with an unused email', async () => {
        await expect(service.signin("asdf@asdf.com", "asdf")).rejects.toThrow(NotFoundException);
    });

    it('Throws if an invalid password is provided', async () => {
        await service.signup("asdf@asdf.com", "asd")
        await expect(service.signup("asdf@asdf.com", "asdf")).rejects.toThrow(BadRequestException);
    });

    it('Returns a user if correct password is provided', async () => {
        await service.signup('olo@ili.com', '1234');

        const user = await service.signin('olo@ili.com', '1234');
        expect(user).toBeDefined();
    })

});

