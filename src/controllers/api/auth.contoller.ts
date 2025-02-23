import { Body, Controller, Post, Put, Req } from "@nestjs/common";
import { LoginAdministratorDto } from "src/dtos/administrator/login.administrator.dto";
import { ApiResponse } from "src/misc/api.response.class";
import { AdministratorService } from "src/services/administrator/administrator.service";
import * as crypto from 'crypto';
import * as jwt from 'jsonwebtoken';
import { resolve } from "path";
import { JwtDataAdministratorDto } from "src/dtos/administrator/jwt.data.administrator.dto";
import { Request } from "express";
import { jwtSecret } from "config/jwt.secret";
import { LoginInfoAdministratorDto } from "src/dtos/administrator/login.info.administrator.dto";
import { UserRegistrationDto } from "src/dtos/user/user.registration.dto";
import { UserService } from "src/services/user/user.service";

@Controller('auth')
export class AuthController {
    constructor(
        public administratorService: AdministratorService,
        public userService: UserService,
    ) {}

    @Post('login') //localhost:3000/auth/login/
    async doLogin(@Body()  data: LoginAdministratorDto, @Req() req: Request): Promise<LoginInfoAdministratorDto | ApiResponse > {
        const administrator = await this.administratorService.getByUsername(data.username);


        if(!administrator) {0
            return new Promise(resolve => resolve(new ApiResponse('error', -3001)))
        }

        const passwordHash = crypto.createHash('sha512');
        passwordHash.update(data.password);
        const passwordHashString = passwordHash.digest('hex').toUpperCase();

        if (administrator.passwordHash !== passwordHashString) {
            return new Promise(resolve => resolve(new ApiResponse('error', -3002)))
        }

        const jwtData = new JwtDataAdministratorDto();
        jwtData.administratorId = administrator.administratorId;
        jwtData.username = administrator.username;
        
        let sada = new Date();
        sada.setDate(sada.getDate() + 14);
        const istekTimestamp = sada.getTime() / 1000;
        jwtData.exp = istekTimestamp;
        jwtData.ip = req.ip ? req.ip.toString() : "";
        jwtData.ua = req.headers["user-agent"] ?? "";

        // proces potpisivanja tokena
        console.log(jwtData.toPlainObject())
        let token: string = jwt.sign(JSON.stringify(jwtData.toPlainObject()), jwtSecret); // ne radi bez JSON.stringify

        const responseObject = new LoginInfoAdministratorDto(
            administrator.administratorId,
            administrator.username,
            token
        );
        
        return new Promise(resolve => resolve(responseObject));
    }

    @Put('user/register') // PUT http://localhost:3000/auth/user/register/
    async userRegister(@Body() data: UserRegistrationDto) {
        return await this.userService.register(data);
    }

}

