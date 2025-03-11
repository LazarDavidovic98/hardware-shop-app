import { Injectable } from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { Repository } from "typeorm";
import { User } from "src/entities/user.entity";
import { ApiResponse } from "src/misc/api.response.class";
import { TypeOrmCrudService } from "@nestjsx/crud-typeorm";
import { UserRegistrationDto } from "src/dtos/user/user.registration.dto";
import * as crypto from 'crypto';
import { UserToken } from "src/entities/user-token.entity";

@Injectable()
export class UserService extends TypeOrmCrudService<User> {
    constructor(
        @InjectRepository(User) private readonly user: Repository<User>,
        @InjectRepository(UserToken) private readonly userToken: Repository<UserToken>,
    ) {
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

    async getById(id: number): Promise<User> {
        const user = await this.user.findOne({ where: { userId: id } });
        if (!user) {
            throw new Error("User not found");
        }
        return user;
    }
    

    async getByEmail(email: string): Promise<User | null> {
        const user = await this.user.findOne({
            where: { email : email }
        });

        if (user) {
            return user;
        }
        
        return null;
    }

    async addToken(userId: number, token: string, expiresAt: string) {
        const userToken = new UserToken();
        userToken.userId = userId;
        userToken.token = token;
        userToken.expiresAt = expiresAt;

        return await this.userToken.save(userToken);
    }

    async getUserToken(token: string): Promise<UserToken | null> {
        return await this.userToken.findOne({
            where: { token: token },
        });
    }

    async invalidateToken(token: string): Promise<UserToken | ApiResponse> {
        const userToken = await this.userToken.findOne({
            where: { token: token },
        });
    
        if (!userToken) {
            return new ApiResponse("error", -10001, "No such refresh token!");
        }
    
        userToken.isValid = 0;
    
        await this.userToken.save(userToken);
    
        const updatedUserToken = await this.getUserToken(token);
        
        if (!updatedUserToken) {
            return new ApiResponse("error", -10002, "Failed to retrieve updated token!");
        }
    
        return updatedUserToken;
    }
    

    async invalidateUserTokens(userId: number): Promise<(UserToken | ApiResponse)[]> {
        const userTokens = await this.userToken.find({
            where: { userId: userId },
        });

        const results: (UserToken | ApiResponse)[] = [];

        for (const userToken of userTokens) {
            results.push(await this.invalidateToken(userToken.token));
        }

        return results;
    }
}
