import { Injectable, Logger } from '@nestjs/common';
import { Connection } from 'typeorm';
import { Helpers } from "../common/Helpers";
import {AppConstants} from "../contants";

const mysql = require('mysql');

@Injectable()
export class InventoryWrapperService {
    private logger = new Logger(InventoryWrapperService.name);
    constructor(
        private readonly connection: Connection,
    ) {
    }

    async getAlternativeRoutes(routePairs, point1, payload, cityDistance, otherRoutePairs = null) {
        const travelDate = payload.travel_date;
        const maxDistance = payload.max_distance ?? 50;

        let results = [];
        for (let routePair of routePairs) {
            let point2 = { latitude: routePair.latitude, longitude: routePair.longitude };
            let distKm = Helpers.getDistanceBetweenTwoCoordinates(point1, point2);
            let element = {
                distance: parseFloat(distKm.toFixed(2)),
                from_city_name: routePair.from_city_name,
                to_city_name: routePair.to_city_name,
                from_city_distance: undefined,
                to_city_distance: undefined,
                from_longitude: undefined,
                from_latitude: undefined,
                to_latitude: undefined,
                to_longitude: undefined
            }

            if (cityDistance === 'from_city') {
                if (distKm < maxDistance) {
                    element.from_city_distance = distKm < 1 ? 'less than 1km' : `${parseFloat(distKm.toFixed(2))}km`;
                    element.to_city_distance = 0;
                    element.from_longitude = routePair.longitude;
                    element.from_latitude = routePair.latitude;
                    element.to_latitude = payload.to_cord.latitude;
                    element.to_longitude = payload.to_cord.longitude;
                    results.push(element);
                }
            }

            if (cityDistance === 'to_city') {
                if (distKm < maxDistance) {
                    element.to_city_distance = distKm < 1 ? 'less than 1km' : `${parseFloat(distKm.toFixed(2))}km`;
                    element.from_city_distance = 0;
                    element.to_longitude = routePair.longitude;
                    element.to_latitude = routePair.latitude;
                    element.from_latitude = payload.from_cord.latitude;
                    element.from_longitude = payload.from_cord.longitude;
                    results.push(element);
                }
            }

            if (otherRoutePairs) {
                let point3 = { latitude: routePair.to_latitude, longitude: routePair.to_longitude };
                let distFrom = Helpers.getDistanceBetweenTwoCoordinates(point1, point2);
                let distTo = Helpers.getDistanceBetweenTwoCoordinates(otherRoutePairs, point3);
                if (distFrom < maxDistance && distTo < maxDistance) {
                    element.to_city_distance = distTo < 1 ? 'less than 1km' : `${parseFloat(distTo.toFixed(2))}km`;
                    element.from_city_distance = distFrom < 1 ? 'less than 1km' : `${parseFloat(distFrom.toFixed(2))}km`;
                    element.to_longitude = routePair.to_longitude;
                    element.to_latitude = routePair.to_latitude;
                    element.from_latitude = routePair.latitude;
                    element.from_longitude = routePair.longitude;
                    results.push(element);
                }
            }
        }

        // Sort in ascending order so that route pair which has lesser distance apart appears top
        results.sort((a, b) => a.distance - b.distance)

        // if route pair is in tbl_route_summary with given travel date then show pricing when available
        for (const item of results) {
            let sql = await mysql.format(AppConstants.SQL.GET_AMOUNT_FOR_ROUTE_PAIR, [travelDate, item.from_city_name, item.to_city_name]);
            const result = (await this.connection.query(sql))[0];
            item.user_fare = result ? result.cheapest_price : null;
            item.currency_symbol = result ? result.currency_symbol : null;
            delete item.distance
        }

        return results;
    }

}