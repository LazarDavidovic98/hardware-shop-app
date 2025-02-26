import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { error } from 'console';
import { Administrator } from 'src/entities/administrator.entity';
import { resolve } from 'path';
import { AddAdministratorDto } from 'src/dtos/administrator/add.administrator.dto';
import { EditAdministratorDto } from 'src/dtos/administrator/edit.administrator.dto';
import { ApiResponse } from 'src/misc/api.response.class';
import { Repository } from 'typeorm';

@Injectable()
export class AdministratorService {
    constructor(
        @InjectRepository(Administrator)
        private readonly administrator: Repository<Administrator>,
    ) {}
    

    getAll(): Promise<Administrator[]>{
        return this.administrator.find();
    }

    
    async getByUsername(username: string): Promise<Administrator | null> {
        const admin = await this.administrator.findOne({
            where: { username: username }
        });

        if (admin) {
            return admin;
        }
        
        return null;
    }


    async getById(id: number): Promise<Administrator | ApiResponse | null> {
        return await this.administrator.findOne({
            where: { administratorId: id }
        });
    }

    add(data: AddAdministratorDto): Promise<Administrator | ApiResponse> {
        // DTO => Model
        // username -> username
        // password - [obrada nekog programa]-> passwordHash

        const crypto = require('crypto');

        const passwordHash = crypto.createHash('sha512');
        passwordHash.update(data.password);

        const passwordHashString = passwordHash.digest('hex').toUpperCase();

        let newAdmin: Administrator = new Administrator();
        newAdmin.username = data.username;
        newAdmin.passwordHash = passwordHashString;

        return new Promise((resolve) => {
            this.administrator.save(newAdmin)
            .then(data => resolve(data))
            .catch(error => {
                const response: ApiResponse = new ApiResponse("error", -1001);
                resolve(response);
            });
        });
    } 

    async editById(id: number, data: EditAdministratorDto): Promise<Administrator | ApiResponse> {
        let admin: Administrator | null = await this.administrator.findOne({
            where: { administratorId: id } // Ispravljeno: administratorId umesto id
        });
    
        if (!admin) {
            throw new Error('Administrator not found');
        }
    
        if (admin === undefined) {
            return new Promise((resolve) => {
               resolve(new ApiResponse("error", -1002));
            });
        }


        const crypto = require('crypto');
        const passwordHash = crypto.createHash('sha512');
        passwordHash.update(data.password);
        const passwordHashString = passwordHash.digest('hex').toUpperCase();
    
        admin.passwordHash = passwordHashString;
    
        return this.administrator.save(admin);
    }
    
    

}

