import * as Validator from 'class-validator';
import { ArticleFeatureComponentDto } from './article.feature.component.dto';
export class AddArticleDto {
    @Validator.IsNotEmpty()
    @Validator.IsString()
    @Validator.Length(5, 128)
    name: string;

    @Validator.IsNotEmpty()
    @Validator.IsString()
    @Validator.Length(10, 255)
    categoryId: number;

    @Validator.IsNotEmpty()
    @Validator.IsString()
    @Validator.Length(10, 255)
    excerpt: string;

    @Validator.IsNotEmpty()
    @Validator.IsPositive()
    @Validator.IsNumber({
        allowInfinity: false,
        allowNaN: false,
        maxDecimalPlaces: 2,
    })
    price: number;

    @Validator.IsNotEmpty()
    @Validator.IsString()
    @Validator.Length(64, 10000)
    description: string;

    @Validator.IsArray()
    @Validator.ValidateNested({
        always: true,
    })
    features: ArticleFeatureComponentDto[];
}

// Ovo posle moramo da iskucamo u Postman-u 
// Ali u obliku JSON strukture i to cemo da saljemo 