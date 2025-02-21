import { Injectable } from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { Repository } from "typeorm";
import { Feature } from "src/entities/feature.entity";
import { ApiResponse } from "src/misc/api.response.class";
import { TypeOrmCrudService } from "@nestjsx/crud-typeorm";

@Injectable()
export class FeatureService extends TypeOrmCrudService<Feature> {
    constructor(@InjectRepository(Feature) private readonly featureRepository: Repository<Feature>) {
        super(featureRepository);
    }

}
