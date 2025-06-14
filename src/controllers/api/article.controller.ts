import { Body, Controller, Delete, Get, Param, Patch, Post, Req, UploadedFile, UseGuards, UseInterceptors} from "@nestjs/common";
import { FileInterceptor } from "@nestjs/platform-express";
import { StorageConfig } from "config/storage.config";
import { AddArticleDto } from "src/dtos/article/add.article.dto";
import { ApiResponse } from "src/misc/api.response.class";
import { ArticleService } from "src/services/article/article.service";
import { fileName } from "typeorm-model-generator/dist/src/NamingStrategy";
import { diskStorage } from "multer";
import { Article } from "src/entities/article.entity";
import { PhotoService } from "src/services/photo/photo.service";
import { Express, query } from 'express';
import { Photo } from "src/entities/photo.entity";
import * as fileType from 'file-type';
import * as fs from 'fs'; // za brisanje koristimo file skistem biblioteku
import * as sharp from 'sharp';
import { DeleteResult } from "typeorm";
import { join } from "path";
import { ArticlePrice } from "src/entities/article-price.entity";
import { ArticleFeature } from "src/entities/article-feature.entity";
import { Crud } from "@nestjsx/crud";
import { EditArticleDto } from "src/dtos/article/edit.erticle.dto";
import { AllowToRoles } from "src/misc/allow.to.roles.descriptor";
import { RoleCheckedGuard } from "src/misc/role.checker.guard";
import { ArticleSearchDto } from "src/dtos/article/article.search.dto";

@Controller('api/article')
@Crud({
    model: {
        type: Article
    },
    params: {
        id: {
            field: 'articleId',
            type: 'number',
            primary: true
        }
    },
    query: {
        join: {
            category: {
                eager: true
            },
            photos: {
                eager: true
            },
            articlePrices: {
                eager: true
            },
            articleFeatures: {
                eager: true
            }
        }
    },
    routes: {
        only: [
            'getOneBase',
            'getManyBase',
        ],
        getOneBase: {
            decorators: [
                UseGuards(RoleCheckedGuard),
                AllowToRoles('administrator', 'user'),
            ]
        },
        getManyBase: {
            decorators: [
                UseGuards(RoleCheckedGuard),
                AllowToRoles('administrator', 'user')
            ],
        },
    },
})
export class ArticleController {

    constructor(
        public service: ArticleService,

        public photoService: PhotoService, 
    ) {}


    @Post() // POST http://localhost:3000/api/article/
    @UseGuards(RoleCheckedGuard)
    @AllowToRoles('administrator')
    createFullArticle(@Body() data: AddArticleDto) {
        return this.service.createFullArticle(data);
    }


    @Patch(':id')
    @UseGuards(RoleCheckedGuard)
    @AllowToRoles('administrator')
    editFullArticle(@Param('id') id: number, @Body() data: EditArticleDto) {
        return this.service.editFullArticle(id, data);
    }


    @Post(':id/uploadPhoto/')
    @UseGuards(RoleCheckedGuard)
    @AllowToRoles('administrator')
    @UseInterceptors(
        FileInterceptor('photo', {
            storage: diskStorage({
                destination: StorageConfig.photo.destination,
                filename: (req, file, callback) => {

                    let original: string = file.originalname;
                    let normalized = original.replace(/\s+/g, '-');
                    normalized = normalized.replace(/[^A-z0-9\.\-]/g, '')
                    let sada = new Date();

                    let datePart = '';
                    datePart += sada.getFullYear().toString();
                    datePart += (sada.getMonth() + 1).toString();
                    datePart += sada.getDate().toString();

                    let randomPart: string = 
                        new Array(10)
                            .fill(0)
                            .map(e => (Math.random() * 9).toFixed(0).toString())
                            .join('');

                    let fileName = datePart + '-' + randomPart + '-' + normalized;    
                    fileName = fileName.toLocaleLowerCase();
                    callback(null, fileName);
                }
            }),
            fileFilter: (req, file, callback) => {
                
                // 1. Check ekstenzije: JPG, PNG
                if (!file.originalname.toLowerCase().match(/\.(jpg|png)$/)) {
                    req.fileFilterError = 'Bad file extension !';
                    callback(null, false);
                    return;
                }

                // 2. Check tipa sadrzaja: image/jpeg, image/png (mimetype)
                if (!(file.mimetype.includes('jpeg') || file.mimetype.includes('png'))) {
                    req.fileFilterError = 'Bad file content !';
                    callback(new Error('Bad file extensions!'), false);
                    return;
                }

                callback(null, true);

            },
            limits: {
                files: 1,
                fileSize: StorageConfig.photo.maxSize, 
            },
        })
    )

    async uploadPhoto(
        @Param('id') articleId: number, 
        @UploadedFile() photo,
        @Req() req
    ): Promise<ApiResponse | Photo> {
        if (req.fileFilterError) {
            return new ApiResponse('error', -4002, req.fileFilterError);
        }

        if (!photo) {
            return new ApiResponse('error', -4002, 'File not uploaded !');
        }

        
        const fileTypeResult = await fileType.fromFile(photo.path); // ne moze da stoji fromFile()
        if (!fileTypeResult) {

            fs.unlinkSync(photo.path);
            return new ApiResponse('error', -4002, 'Bad file content type !');
        } 

        const realMimeType = fileTypeResult.mime;
        if (!(realMimeType.includes('jpeg') || realMimeType.includes('png'))) {

            fs.unlinkSync(photo.path);
            return new ApiResponse('error', -4002, 'Bad file content type !');
        }

        // TODO: Save a resized file 
        await this.createResizedImage(photo, StorageConfig.photo.resize.thumb);
        await this.createResizedImage(photo, StorageConfig.photo.resize.small);

        const newPhoto: Photo = new Photo();
        newPhoto.articleId = articleId;
        newPhoto.imagePath = photo.filename;

        const savedPhoto = await this.photoService.add(newPhoto);
        if (!savedPhoto) {
            return new ApiResponse('error', -4001);
        }

        return savedPhoto; 

    }

    async createResizedImage(photo, resizeSettings) {

        const originalFilePath = photo.path;
        const fileName = photo.filename;

        const destinationFilePath = 
            StorageConfig.photo.destination + 
            resizeSettings.directory + 
            fileName;

        await sharp(originalFilePath)
            .resize({
                fit: 'cover', // probati contain umesto cover, dodace crnu borduru levo i desno
                width: resizeSettings.width,
                height: resizeSettings.height,
            })
            .toFile(destinationFilePath);
    }

    
    @Delete(':articleId/deletePhoto/:photoId')
    @UseGuards(RoleCheckedGuard)
    @AllowToRoles('administrator')
    public async deletePhoto(
        @Param('articleId') articleId: number,
        @Param('photoId') photoId: number,

    ) {
        const foundArticle = await this.service.findOne({
            where: { articleId: articleId }, // Ovaj deo ispravlja grešku
            relations: ["category", "articleFeatures", "features", "articlePrices"]
        });
        
        const photo = await this.photoService.findOne({ where: { photoId: photoId } });

        if (!photo) {
            return new ApiResponse('error', -40004, 'Photo not found!');
        }


        fs.unlinkSync(StorageConfig.photo.destination + photo.imagePath);
        fs.unlinkSync(StorageConfig.photo.destination + 
                    StorageConfig.photo.resize.thumb.directory + 
                    photo.imagePath);
        fs.unlinkSync(StorageConfig.photo.destination + 
                    StorageConfig.photo.resize.thumb.directory + 
                    photo.imagePath);

        const deleteResult = await this.photoService.deleteById(photoId);



        if (deleteResult.affected === 0) {
            return new ApiResponse('error', -4004, 'Photo not found!');
        }

        return new ApiResponse('ok', 0, 'One photo deleted !');
    }

    @Post('search')
    @UseGuards(RoleCheckedGuard)
    @AllowToRoles('administrator', 'user')
    async search(@Body() data: ArticleSearchDto): Promise<Article[]> {
        return await this.service.search(data);
    }

}



