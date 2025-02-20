import { Body, Controller, Get, Param, Post, Req, UploadedFile, UseInterceptors} from "@nestjs/common";
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
import * as fileType from 'file-type';
import * as fs from 'fs'; // za brisanje koristimo file skistem biblioteku
import * as sharp from 'sharp';

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
                fileSize: StorageConfig.photoMaxFileSize, 
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
        await this.createThumb(photo);
        await this.createSmallImage(photo);

        const newPhoto: Photo = new Photo();
        newPhoto.articleId = articleId;
        newPhoto.imagePath = photo.filename;

        const savedPhoto = await this.photoService.add(newPhoto);
        if (!savedPhoto) {
            return new ApiResponse('error', -4001);
        }

        return savedPhoto; 

    }

    async createThumb(photo) {

        const originalFilePath = photo.path;
        const fileName = photo.filename;
        const destinationFilePath = StorageConfig.photoDestination + "thumb/" + fileName;

        await sharp(originalFilePath)
            .resize({
                fit: 'cover', // probati contain umesto cover, dodace crnu borduru levo i desno
                width: StorageConfig.photoThumbSize.width,
                height: StorageConfig.photoThumbSize.height,
                background: {
                    r: 255, g: 255, b: 255, alpha: 0.0
                }
            })
            .toFile(destinationFilePath);
    }

    async createSmallImage(photo) {

        const originalFilePath = photo.path;
        const fileName = photo.filename;
        const destinationFilePath = StorageConfig.photoDestination + "small/" + fileName;

        await sharp(originalFilePath)
            .resize({
                fit: 'cover', // probati contain umesto cover, dodace crnu borduru levo i desno
                width: StorageConfig.photoSmallSize.width,
                height: StorageConfig.photoSmallSize.height,
                background: {
                    r: 255, g: 255, b: 255, alpha: 0.0
                }
            })
            .toFile(destinationFilePath);

    }



}



