import { Body, Controller, Get, Param, Post} from "@nestjs/common";
import { AddArticleDto } from "src/dtos/article/add.article.dto";
import { ApiResponse } from "src/misc/api.response.class";
import { ArticleService } from "src/services/article/article.service";

@Controller('api/article')
export class ArticleController {

    constructor(public service: ArticleService) {}

    @Post('createFull')
    createFullArticle(@Body() data: AddArticleDto) {
        return this.service.createFullArticle(data);
    }

}



