import { Injectable } from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { TypeOrmCrudService } from "@nestjsx/crud-typeorm";
import { ArticleFeature } from "src/entities/article-feature.entity";
import { ArticlePrice } from "src/entities/article-price.entity";
import { Article } from "src/entities/article.entity";
import { AddArticleDto } from "src/dtos/article/add.article.dto";
import { ApiResponse } from "src/misc/api.response.class";
import { Like, Repository } from "typeorm";
import { EditArticleDto } from "src/dtos/article/edit.erticle.dto";
import { ArticleSearchDto } from "src/dtos/article/article.search.dto";
import { max } from "class-validator";
import { In } from "typeorm";


@Injectable()
export class ArticleService extends TypeOrmCrudService<Article> {

    constructor(

        @InjectRepository(Article) 
        private readonly article: Repository<Article>,

        @InjectRepository(ArticlePrice)
        private readonly articlePrice: Repository<ArticlePrice>,

        @InjectRepository(ArticleFeature)
        private readonly articleFeature: Repository<ArticleFeature>,

    ) {
        super(article);
    }

    // Pravimo rucno servisni metod koji ce da nam obradi onaj slozeni ArticleDTO
    async createFullArticle(data: AddArticleDto): Promise<Article | ApiResponse> {
        let newArticle: Article  = new Article();
        newArticle.name          = data.name;
        newArticle.categoryId    = data.categoryId;
        newArticle.excerpt       = data.excerpt;
        newArticle.description   = data.description;
    
        let savedArticle = await this.article.save(newArticle);
    
        let newArticlePrice: ArticlePrice = new ArticlePrice();
        newArticlePrice.articleId = savedArticle.articleId;
        newArticlePrice.price     = data.price;
        
        await this.articlePrice.save(newArticlePrice);
    
        for (let feature of data.features) {
            let newArticleFeature: ArticleFeature = new ArticleFeature(); 
            newArticleFeature.articleId = savedArticle.articleId;
            newArticleFeature.featureId = feature.featureId;
            newArticleFeature.value     = feature.value;
    
            await this.articleFeature.save(newArticleFeature);
        }
    
        // Ispravljen način poziva `findOne`
        const foundArticle = await this.article.findOne({
            where: { articleId: savedArticle.articleId }, //  Korišćen ispravan format
            relations: ["category", "articleFeatures", "features", "articlePrices"]
        });
    
        // Ako `findOne` vrati null, vraćamo ApiResponse umesto null vrednosti
        if (!foundArticle) {
            return new ApiResponse("error", -1003, "Article not found");
        }
    
        return foundArticle;
    }
    
    async editFullArticle(articleId: number, data: EditArticleDto): Promise<Article | ApiResponse> {
        const existingArticle: Article | null = await this.article.findOne({
            where: { articleId: articleId },
            relations: ['articlePrices', 'articleFeatures']
        });


        if (!existingArticle) {
            return new ApiResponse('error', -5001, 'Article not found.');
        }

        existingArticle.name          = data.name;
        existingArticle.categoryId    = data.categoryId;
        existingArticle.excerpt       = data.excerpt;
        existingArticle.description   = data.excerpt;
        existingArticle.status        = data.status;
        existingArticle.isPromoted    = data.isPromoted;

        const savedArticle = await this.article.save(existingArticle);
        if (!savedArticle) {
            return new ApiResponse('error', -5002, 'Could not save new article data.');
        }

        const newPriceString: string = Number(data.price).toFixed(2);
        
        const lastPrice = existingArticle.articlePrices[existingArticle.articlePrices.length - 1];

        const lastPriceString: string = Number(lastPrice).toFixed(2);

        if (newPriceString !== lastPriceString) {
            const newArticlePrice = new ArticlePrice();
            newArticlePrice.articleId = articleId;
            newArticlePrice.price = data.price;

            const savedArticlePrice = await this.articlePrice.save(newArticlePrice);
            if (!savedArticlePrice) {
                return new ApiResponse('error', -5003, 'Could not save the new article price !');
            }
        }

        if (data.features !== null) {
            await this.articleFeature.remove(existingArticle.articleFeatures);

            for (let feature of data.features) {
                let newArticleFeature: ArticleFeature = new ArticleFeature();
                newArticleFeature.articleId = articleId;
                newArticleFeature.featureId = feature.featureId;
                newArticleFeature.value     = feature.value;

                await this.articleFeature.save(newArticleFeature);
            }
        }
        
        const updatedArticle = await this.article.findOne({
            where: { articleId: articleId },
            relations: [
                "category",
                "articleFeatures",
                "features",
                "articlePrices"
            ]
        });
        
        // Proveri da li je rezultat null
        if (!updatedArticle) {
            return new ApiResponse("error", -5004, "Updated article not found.");
        }
        
        return updatedArticle;
        
    }

    async search (data: ArticleSearchDto): Promise<Article[]> {
        const builder = await this.article.createQueryBuilder("article");
    
        builder.innerJoinAndSelect(
            "article.articlePrices",
            "ap",
            "ap.createdAt = (SELECT MAX(ap.created_at) FROM article_price AS ap WHERE ap.articleId = article.articleId)"

        );
        builder.leftJoinAndSelect("article.articleFeatures", "af");
    
        builder.where('article.categoryId = :catId', { catId: data.categoryId });
    
        if (data.keywords && data.keywords.length > 0) {
            builder.andWhere(
                `(
                article.name LIKE :kw OR 
                article.excerpt LIKE :kw OR 
                article.description LIKE :kw
                )`,
                { kw: '%' + data.keywords + '%' }
            );
        }
    
        if (typeof data.priceMin === "number") {
            builder.andWhere('ap.price >= :min', { min: data.priceMin }); // Ispravljeno 'app.price' u 'ap.price'
        }
    
        if (typeof data.priceMax === "number") {
            builder.andWhere('ap.price <= :max', { max: data.priceMax }); // Ispravljeno 'app.price' u 'ap.price'
        }
    
        if (Array.isArray(data.features) && data.features.length > 0) {  // <-- ISPRAVLJENO
            for (const feature of data.features) {
                builder.andWhere(
                    'af.featureId = :fId AND af.value IN (:...fVals)',
                    {
                        fId: feature.featureId,
                        fVals: feature.values,
                    }
                );
            }
        }
    
        let orderBy = 'article.name';
        let orderDirection: 'ASC' | 'DESC' = 'ASC';
    
        if (data.orderBy) {
            orderBy = data.orderBy;
    
            // Razlikuje se ono sto korisnik vidi i ono sto je u bazi upisano
            if (orderBy === 'price') {
                orderBy = 'ap.price';
            }

            if (orderBy === 'name') {
                orderBy = 'article.name';  
            }
        }
    
        if (data.orderDirection) {
            orderDirection = data.orderDirection.toUpperCase() as 'ASC' | 'DESC';
        }
    
        builder.orderBy(orderBy, orderDirection);
    
        let page = 0;
        let perPage: 5 | 10 | 25 | 50 | 75 = 25;
    
        if (typeof data.page === 'number') {
            page = data.page;
        }
    
        if (typeof data.itemsPerPage === 'number') {
            perPage = data.itemsPerPage;
        } 
    
        builder.skip(page * perPage);
        builder.take(perPage);
    
        let articleIds = await (await builder.getMany()).map(article => article.articleId);
        
        return await this.article.find({
            where: { articleId: In(articleIds) },
            relations: [
                "category",
                "articleFeatures",
                "features",
                "articlePrices"
            ]
        });
    }
    
}