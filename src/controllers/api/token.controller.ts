import { Body, Controller, HttpException, HttpStatus, Post, Req, UseGuards } from "@nestjs/common";
import { UserRefreshTokenDto } from "src/dtos/auth/user.refresh.token.dto";
import { AllowToRoles } from "src/misc/allow.to.roles.descriptor";
import { ApiResponse } from "src/misc/api.response.class";
import { RoleCheckedGuard } from "src/misc/role.checker.guard";
import { AdministratorService } from "src/services/administrator/administrator.service";
import { UserService } from "src/services/user/user.service";
import * as jwt from 'jsonwebtoken';
import { JwtRefreshDataDto } from "src/dtos/auth/jwt.refresh.dto";
import { jwtSecret } from "config/jwt.secret";
import { LoginInfoDto } from "src/dtos/auth/login.info.dto";
import { JwtDataDto } from "src/dtos/auth/jwt.data.dto";

@Controller('token')
export class TokenController {
    constructor (
        private administratorService: AdministratorService,
        private userService: UserService,
    ){ }

    @Post('user/refresh') // http://localhost:3000/token/user/refresh
    @UseGuards(RoleCheckedGuard)
    @AllowToRoles('user')
    async userTokenRefresh(@Req() req: Request, @Body() data: UserRefreshTokenDto): Promise<LoginInfoDto | ApiResponse> {
        const userToken = await this.userService.getUserToken(data.token);

        if (!userToken) {
            return new ApiResponse("error", -10002, "No such refresh token !");
        }

        if (userToken.isValid === 0) {
            return new ApiResponse("error", -10003, "The token is no longer valid !");
        }

        const sada = new Date();
        const datumIsteka = new Date(userToken.expiresAt.replace(" ", "T") + "Z")

        if (datumIsteka.getTime() < sada.getTime()) {
            return new ApiResponse("error", -10004, "The token has expired !");
        }

        let jwtRefreshData: JwtRefreshDataDto;

        try {
            jwtRefreshData = jwt.verify(data.token, jwtSecret)
        } catch (e) {
            throw new HttpException('Bad token found', HttpStatus.UNAUTHORIZED);
        }

        if (!jwtRefreshData) {
            throw new HttpException('Bad token found', HttpStatus.UNAUTHORIZED);
        }

        if (jwtRefreshData.ip !== (req as any).ip.toString()) {
            throw new HttpException('Bad token found', HttpStatus.UNAUTHORIZED);
        }

        if (jwtRefreshData.ua !== req.headers["user-agent"]) {
            throw new HttpException('Bad token found', HttpStatus.UNAUTHORIZED);
        }

        const jwtData = new JwtDataDto();
        jwtData.role = jwtRefreshData.role;
        jwtData.id = jwtRefreshData.id;
        jwtData.identity = jwtRefreshData.identity;
        jwtData.exp = this.getDataPlus(60 * 5); // Token važi 5 minuta
        jwtData.ip = jwtRefreshData.ip;
        jwtData.ua = jwtRefreshData.ua;

        let token: string = jwt.sign(JSON.stringify(jwtData.toPlainObject()), jwtSecret);

        const responseObject = new LoginInfoDto (
            jwtData.id,
            jwtData.identity,
            token,
            data.token,
            this.getIsoDate(jwtRefreshData.exp),
        );

        return responseObject;
    }

    private getDataPlus(numberOfSeconds: number): number {
        return new Date().getTime() / 1000 + numberOfSeconds;
    }

    private getIsoDate(timestamp: number): string {
        const date = new Date(timestamp * 1000);
        return date.toISOString();
    }
}