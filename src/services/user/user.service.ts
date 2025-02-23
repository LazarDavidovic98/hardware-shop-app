import { Injectable } from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { Repository } from "typeorm";
import { User } from "src/entities/user.entity";
import { ApiResponse } from "src/misc/api.response.class";
import { TypeOrmCrudService } from "@nestjsx/crud-typeorm";
import { UserRegistrationDto } from "src/dtos/user/user.registration.dto";
import * as crypto from 'crypto';

@Injectable()
export class UserService extends TypeOrmCrudService<User> {
    constructor(@InjectRepository(User) private readonly user: Repository<User>) {
        super(user);
    }

    // Pravimo metod za registraciju => pozivamo ga u auth controller-u

    async register(data: UserRegistrationDto): Promise<User | ApiResponse> {
        const passwordHash = crypto.createHash('sha512');
        passwordHash.update(data.password);
        const passwordHashString = passwordHash.digest('hex').toUpperCase();

        const newUser: User = new User();
        newUser.email         = data.email;
        newUser.passwordHash  = passwordHashString;
        newUser.forname       = data.forname;
        newUser.surname       = data.surname;
        newUser.phoneNumber   = data.phoneNumber;
        newUser.postalAddress = data.postalAddress;

        // Implementiramo pokusaj kreiranja user-a i upravljanje greskama:
        
        try {
            const savedUser = await this.user.save(newUser);

            if (!savedUser) {
                throw new Error('');
            }
            
            return savedUser;

        } catch (e) {
            return new ApiResponse('error', -6001, 'This user acount cannot be created.');
        }
    }
}
