import {Body, Controller, Get, HttpCode, Post, UseGuards} from '@nestjs/common';
import {InventoryService} from './inventory.service';
import {
    ApiBadRequestResponse,
    ApiBearerAuth,
    ApiOperation,
    ApiProduces,
    ApiResponse,
    ApiTags
} from '@nestjs/swagger';
import {
    InventoryAlternativeRoutesPayload,
    InventoryAlternativeRoutesResponse
} from './params';
import {AuthGuard} from '@nestjs/passport';
import {ValidationError} from "../common/validation-error.dto";
import { AppConstants} from "../contants";
import {Connection} from "typeorm";
const mysql = require('mysql');

@ApiBearerAuth()
@Controller('inventory')
@ApiProduces('application/json')
@UseGuards(AuthGuard('jwt'))
@ApiTags('Inventory')
export class InventoryController {
    constructor(
        private srv: InventoryService,
        private readonly connection: Connection,
    ) {
    }

    @Post('alternative-routes')
    @HttpCode(200)
    @ApiBadRequestResponse({ type: ValidationError })
    @ApiOperation({ description: 'b2c journey flow with alternative routes' })
    @ApiResponse({ status: 200, type: InventoryAlternativeRoutesResponse })
    async getInventoryAlternativeRoutes(
        @Body() body: InventoryAlternativeRoutesPayload
    ): Promise<InventoryAlternativeRoutesResponse> {
        if (body.from_group_id) {
            let sql = mysql.format(AppConstants.SQL.GET_CITY_GROUP_NAME, body.from_group_id);
            body.from_city_name = (await this.connection.query(sql))[0]?.name;
        }
        if (body.to_group_id) {
            let sql = mysql.format(AppConstants.SQL.GET_CITY_GROUP_NAME, body.to_group_id);
            body.to_city_name = (await this.connection.query(sql))[0]?.name;
        }
        return {
            outbound: await this.srv.getAlternativeRoutes(body, body.outbound_date, body.from_city_name, body.to_city_name),
            inbound: body.inbound_date ?
                await this.srv.getAlternativeRoutes(body, body.inbound_date, body.to_city_name, body.from_city_name) :
                undefined
        }
    }
}