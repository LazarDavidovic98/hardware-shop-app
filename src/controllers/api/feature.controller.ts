import { Body, Controller, Get, Param, Post, UseGuards } from "@nestjs/common";
import { Crud, CrudController, CrudRequest, Override, ParsedRequest } from "@nestjsx/crud";
import { Feature } from "src/entities/feature.entity";
import { AllowToRoles } from "src/misc/allow.to.roles.descriptor";
import { ApiResponse } from "src/misc/api.response.class";
import { RoleCheckedGuard } from "src/misc/role.checker.guard";
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
    }, 
    routes: {
        only: [
            "createOneBase",
            "createManyBase",
            "getManyBase",
            "getOneBase",
            "updateOneBase",
        ],
        createOneBase: {
            decorators: [
                UseGuards(RoleCheckedGuard),
                AllowToRoles('administrator'),
            ],
        }, 
        createManyBase: {
            decorators: [
                UseGuards(RoleCheckedGuard),
                AllowToRoles('administrator'),
            ],
        },
        updateOneBase: {
            decorators: [
                 UseGuards(RoleCheckedGuard),
                 AllowToRoles('administrator'),
            ],
        },
        getManyBase: {
            decorators: [
                UseGuards(RoleCheckedGuard),
                AllowToRoles('administrator', 'user'),
            ],
        },
        getOneBase: {
            decorators: [
                UseGuards(RoleCheckedGuard),
                AllowToRoles('administrator', 'user'),
            ],
        },
    },
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
