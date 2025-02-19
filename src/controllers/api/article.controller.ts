import { Body, Controller, Get, Param, Post, UploadedFile, UseInterceptors} from "@nestjs/common";
import { FileInterceptor } from "@nestjs/platform-express";
import { StorageConfig } from "config/storage.config";
import { AddArticleDto } from "src/dtos/article/add.article.dto";
import { ApiResponse } from "src/misc/api.response.class";
import { ArticleService } from "src/services/article/article.service";
import { fileName } from "typeorm-model-generator/dist/src/NamingStrategy";
import { diskStorage } from "multer";
import { Article } from "entities/article.entity";
import { PhotoService } from "src/services/photo/photo.service";
import { Express } from 'express';
import { Photo } from "entities/photo.entity";


@Controller('api/article')
export class ArticleController {

    constructor(
        public service: ArticleService,

        public photoService: PhotoService, 
    ) {}

    @Post('createFull')
    createFullArticle(@Body() data: AddArticleDto) {
        return this.service.createFullArticle(data);
    }

    @Post(':id/uploadPhoto/')
    @UseInterceptors(
        FileInterceptor('photo', {
            storage: diskStorage({
                destination: StorageConfig.photoDestination,
                filename: (req, file, callback) => {

                    let original: string = file.originalname;
                    let normalized = original.replace(/\W+/g, '-');
                    let sada = new Date();

                    let datePart = '';
                    datePart += sada.getFullYear().toString();
                    datePart += (sada.getMonth() + 1).toString();
                    datePart += sada.getDate().toString();

                    let randomPart: string = 
                        new Array(10)
                            .fill(0)
                            .map(e => (Math.random() * 9).toString())
                            .join('');

                    let fileName = datePart + '-' + randomPart + '-' + normalized;    
                    
                    callback(null, fileName);
                }
            }),
            fileFilter: (req, file, callback) => {
                // 1. Check ekstenzije: JPG, PNG
                // 2. Check tipa sadrzaja: image/jpeg, image/png (mimetype)

                if (!file.originalname.match(/\.(jpg|png)$/)) {
                    callback(new Error('Bad file extensions!'), false);
                    return;
                }

                if (!(file.mimetype.includes('jpeg') || file.mimetype.includes('png'))) {
                    callback(new Error('Bad file extensions!'), false);
                    return;
                }

                callback(null, true);

            },
            limits: {
                files: 1,
                fieldSize: StorageConfig.photoMaxFileSize, 
            },
        })
    )

    async uploadPhoto(@Param('id') articleId: number, @UploadedFile() photo): Promise<ApiResponse | Photo> {
        //let imagePath = photo.filename; // u zapis u bazu podataka

        const newPhoto: Photo = new Photo();
        newPhoto.articleId = articleId;
        newPhoto.imagePath = photo.filename;

        const savedPhoto = await this.photoService.add(newPhoto);
        if (!savedPhoto) {
            return new ApiResponse('error', -4001);
        }

        return savedPhoto;

    }

}



