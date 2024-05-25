import { Injectable } from '@nestjs/common';
import { Connection } from 'typeorm';
import {AppConstants} from "../contants";
import {
    InventoryAlternativeRoutes
} from './params';
import { InventoryWrapperService } from './inventory.wrapper';
import { MongoCacheService } from '../jobs/cache/mongo.cache.service';
const mysql = require('mysql');

@Injectable()
export class InventoryService {
    constructor(
        private readonly connection: Connection,
        private readonly inventoryWrapper: InventoryWrapperService,
        private readonly mongoCache: MongoCacheService,
    ) {
    }

    async getAlternativeRoutes(payload, travelDate, fromCity, toCity): Promise<InventoryAlternativeRoutes> {
        let key = `${AppConstants.CACHE_KEYS.ALTERNATIVE_ROUTES_PREFIX}${payload.clear_cache}_${payload.from_city_name}_` +
            `${payload.to_city_name}_${payload.operator_ids?.toString()}_${payload.outbound_date}_${payload.inbound_date}` +
            `_${payload.app_name}_${payload.country_code}_${payload.max_distance}_${payload.return_actual_route}` +
            `${payload.from_city_excluded?.toString()}_${payload.to_city_excluded?.toString()}_${payload.from_group_id}_${payload.to_group_id}`;
        if (payload.clear_cache) await this.mongoCache.unset(key);
        let cached = await this.mongoCache.get(key);
        if (cached) return cached.document;

        payload.travel_date = travelDate;
        // Get longitude and latitude of departure city
        let sqlFromCord = await mysql.format(AppConstants.SQL.GET_LAT_LNG, [fromCity]);
        const fromCord = (await this.connection.query(sqlFromCord))[0];

        // Get longitude and latitude of arrival city
        let sqlToCord = await mysql.format(AppConstants.SQL.GET_LAT_LNG, [toCity]);
        const toCord = (await this.connection.query(sqlToCord))[0];

        payload.from_cord = fromCord;
        payload.to_cord = toCord;
        let filters = [];
        if (payload.app_name) filters.push(`appName = ${mysql.escape(payload.app_name)}`);
        if (payload.country_code) filters.push(`(from_country_code=${mysql.escape(payload.country_code)} OR to_country_code=${mysql.escape(payload.country_code)})`);
        if (payload.operator_ids?.length > 0) {
            let filterSet = []
            payload.operator_ids.map((item) => filterSet.push(`FIND_IN_SET(${mysql.escape(item)}, operator_ids)`));
            filters.push(`(${filterSet.join(' OR ')})`);
        } else {
            filters.push(`operator_ids != ''`);
        }

        // Get other route pairs that are going to arrival city and not departure city
        let fromRouteFilters = [];
        fromRouteFilters.push(`to_group_city_name = ${mysql.escape(toCity)}`);
        fromRouteFilters.push(`from_group_city_name NOT IN (${mysql.escape(fromCity)}, ${mysql.escape(toCity)})`);
        let sqlFromRoutes = await mysql.format(AppConstants.SQL.GET_FROM_ROUTES, [mysql.raw([...fromRouteFilters, ...filters].join(' AND '))]);
        const fromRoutes = await this.connection.query(sqlFromRoutes);

        // Get other route pairs that are going from departure city and not arrival city
        let toRouteFilters = [];
        toRouteFilters.push(`to_group_city_name NOT IN (${mysql.escape(toCity)}, ${mysql.escape(fromCity)})`);
        toRouteFilters.push(`from_group_city_name = ${mysql.escape(fromCity)}`);
        let sqlToRoutes = await mysql.format(AppConstants.SQL.GET_TO_ROUTES, [mysql.raw([...toRouteFilters, ...filters].join(' AND '))]);
        const toRoutes = await this.connection.query(sqlToRoutes);

        // Get other route pairs are neither going from departure city nor arrival city
        let otherRouteFilters = [];
        otherRouteFilters.push(`to_group_city_name != ${mysql.escape(toCity)}`);
        otherRouteFilters.push(`from_group_city_name != ${mysql.escape(fromCity)}`);
        let sqlOtherRoutes = await mysql.format(AppConstants.SQL.GET_OTHER_ROUTES, [mysql.raw([...otherRouteFilters, ...filters].join(' AND '))]);
        const otherRoutes = await this.connection.query(sqlOtherRoutes);

        // Get the actual searched route pair result
        let actual_route = [];
        if (payload.return_actual_route) {
            let sql = await mysql.format(AppConstants.SQL.GET_ACTUAL_ROUTE, [fromCity, toCity, travelDate]);
            actual_route = await this.connection.query(sql);
        }

        // Get other route pairs near departure city
        let from_routes = await this.inventoryWrapper.getAlternativeRoutes(fromRoutes, fromCord, payload, 'from_city');
        // Get other route pairs near arrival city
        let to_routes = await this.inventoryWrapper.getAlternativeRoutes(toRoutes, toCord, payload, 'to_city');
        // Get other route pairs near arrival city or departure city
        let other_routes = await this.inventoryWrapper.getAlternativeRoutes(otherRoutes, fromCord, payload, 'other_city', toCord);
        let result = {
            actual_route,
            from_routes,
            to_routes,
            other_routes
        }

        await this.mongoCache.set(key, result, 6);
        return result;
    }
}
