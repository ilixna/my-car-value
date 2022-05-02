import { Test, TestingModule } from '@nestjs/testing';
import { UsersController } from './users.controller';
import { UsersService } from 'src/users/users.service';
import { AuthService } from 'src/users/auth.service';
import { User } from 'src/users/user.entity';
import { NotFoundException } from '@nestjs/common';
import { async } from 'rxjs';
import { ILike } from 'typeorm';
 
describe('UsersController', () => {
  let controller: UsersController;
  let fakeUsersService: Partial<UsersService>;
  let fakeAuthService: Partial<AuthService>;

  beforeEach(async () => {
    fakeAuthService = { 
      //signup: () => {},
      signin: (email: string, password: string) => {
        return Promise.resolve({id: 1, email, password} as User);
      }

    };

    fakeUsersService = {
      findOne: (id: number) => {
        return Promise.resolve({id, email: 'ili@ili.com', password: '1234'} as User)
      },
      find: (email: string) => {
        return Promise.resolve([{id: 1, email, password: '1234'} as User]);
      },
      //remove: () => {},
      //update: () => {}
    }

    const module: TestingModule = await Test.createTestingModule({
      controllers: [UsersController],
      providers: [
        {provide: UsersService, useValue: fakeUsersService}, {provide: AuthService, useValue: fakeAuthService}
      ]
    }).compile();

    controller = module.get<UsersController>(UsersController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  it('finallusers return aa list of users with the given email', async () => {
    const users = await controller.findAllUsers('ili@ili.com');

    expect(users.length).toEqual(1);
    expect(users[0].email).toEqual('ili@ili.com');
  });

  it('findUser returns a single user with the given id', async () => {
    const users = await controller.findUser('1');

    expect(users).toBeDefined();
  })

  it('findUser throws an error if user with given id is not found', async () => {
    fakeUsersService.findOne = () => null

    await expect(controller.findUser('1')).rejects.toThrow(NotFoundException);
  });

  it('signin updates session object and returns user', async () => {
    const session = {userId: -10};
    const user = await controller.signin({email: 'ili@ili.com', password: '1234'}, session);

    expect(user.id).toEqual(1);
    expect(session.userId).toEqual(1);
  })

});
