import { Body, Controller, Get, Param, Post } from "@nestjs/common";
import { Crud, CrudController, CrudRequest, Override, ParsedRequest } from "@nestjsx/crud";
import { Feature } from "src/entities/feature.entity";
import { ApiResponse } from "src/misc/api.response.class";
import { FeatureService } from "src/services/feature/feature.service";

@Controller('api/feature')
@Crud({
    model: {
        type: Feature
    },
    params: {
        id: {
            field: 'featureId',
            type: 'number',
            primary: true
        }
    },
    query: {
        join: {
            category: {
                eager: true
            },
            articleFeatures: {
                eager: false
            },
            articles: {
                eager: false
            }
        }
    }
})
export class FeatureController implements CrudController<Feature> {
    constructor(public service: FeatureService) {} // Mora biti public da bi CrudController mogao da koristi servis

    // Ako želiš da prepišeš default 'getMany' metodu iz CRUD-a, koristi @Override()
    @Override()
    getMany(@ParsedRequest() req: CrudRequest) {
        return this.service.getMany(req);
    }

    @Get(':id')
    async getOne(@Param('id') id: number) {
        return this.service.findOne({ where: { featureId: id } });
    }

}
