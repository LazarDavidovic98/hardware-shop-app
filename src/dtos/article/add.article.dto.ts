export class AddArticleDto {
    name: string;
    categoryId: number;
    excerpt: string;
    description: string;
    price: number;
    features: {
        featureId: number;
        value: string;
    }[];
}

// Ovo posle moramo da iskucamo u Postman-u 
// Ali u obliku JSON strukture i to cemo da saljemo 