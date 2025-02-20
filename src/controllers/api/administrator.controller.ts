import { Body, Controller, Get, Param, Put, Post } from "@nestjs/common";
import { Administrator } from "src/entities/administrator.entity";
import { AdministratorDto } from "src/dtos/administrator/add.administrator.dto";
import { EditAdministratorDto } from "src/dtos/administrator/edit.administrator.dto";
import { ApiResponse } from "src/misc/api.response.class";
import { AdministratorService } from "src/services/administrator/administrator.service";

@Controller('api/administrator')
export class AdministratorController {
    constructor(
        private administratorService: AdministratorService
    ){}

    // sada nema potrebe da navodimo prefiks u Get() vec postoji jer je sadrzan u Controller-ui
    @Get() //http://localhost:3000/api/administrator/
    getAll(): Promise<Administrator[]> {
      return this.administratorService.getAll();
    }

    // GET http://localhost:3000/api/administrator/4/
    @Get(':id')
    getById(@Param('id') administratorId: number): Promise<Administrator | ApiResponse | null> {
        return new Promise(async (resolve) => {
            let admin = await this.administratorService.getById(administratorId);

            if (admin === undefined) {
                resolve(new ApiResponse("error", -1002));
            }

            resolve(admin);
        });
    }
    
    
    // PUT http://localhost:3000/api/administrator/
    @Put()
    add(@Body() data: AdministratorDto): Promise<Administrator | ApiResponse> {
        return this.administratorService.add(data);
    }

    // POST http://localhost:3000/api/administrator/4/
    @Post(':id')
    edit(@Param('id') id: number, @Body() data: EditAdministratorDto): Promise<Administrator | ApiResponse> {
        return this.administratorService.editById(id, data);
    }
    
}   