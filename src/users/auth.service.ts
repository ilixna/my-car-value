import { BadRequestException, Injectable, NotFoundException } from "@nestjs/common";
import { UsersService } from "./users.service";
import { randomBytes, scrypt as _scrypt } from "crypto";
import { promisify } from "util";

const scrypt = promisify(_scrypt);

@Injectable()
export class AuthService {

    constructor (private usersService: UsersService) {

    }

    async signup (email: string, password: string) {
        // step 1 : see if email is in use 
        const user = await this.usersService.find(email);
        if (user.length) {
            throw new BadRequestException('email in use');
        }
        // step 2 : hash users password
            //generate a salt
            const salt = randomBytes(8).toString('hex');
            // hash the salt and the password together
            const hash = (await scrypt(password, salt, 32)) as Buffer;
            //join the hashed result and the salt together
            const passwordResult = salt + '.' + hash.toString('hex');
        // step 3 : create a new user and save it
            const users = await this.usersService.create(email, passwordResult);
        // step 4 : return the user 
        return users;
    }

    async signin (email: string, password: string) {
        const [user] = await this.usersService.find(email);
        if (!user) {
            throw new NotFoundException('user not found');
        }

        const [salt, storedHash] = user.password.split('.');
        const hash = (await scrypt(password, salt, 32)) as Buffer;
        if (storedHash !== hash.toString('hex')){
            throw new BadRequestException('bad password');
        }

        return user;
    }

}