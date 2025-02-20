import { Controller, Get, Param} from "@nestjs/common";
import { CategoryService } from "src/services/category/category.service";
import { Category } from "src/entities/category.entity";
import { ApiResponse } from "src/misc/api.response.class";

@Controller('api/category')
export class CategoryController {
    constructor(private readonly categoryService: CategoryService) {}

    @Get()
    async getAll(): Promise<Category[]> {
        return this.categoryService.findAll();
    }


}



