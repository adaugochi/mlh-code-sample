import { ApiProperty } from "@nestjs/swagger";
import {
    IsNotEmpty,
    IsInt,
    IsOptional,
    IsString,
    ValidateIf, Validate
} from 'class-validator';
import { CityGroupIdValidation } from "../common/custom-validation/city-group-id.validation";
import {Helpers} from "../common/Helpers";
const isNullOrEmpty = require('is-null-or-empty');


export class InventoryAlternativeRoutesPayload {
    @ValidateIf(o => isNullOrEmpty(o.from_group_id))
    @IsString()
    @ApiProperty({ required: true, example: 'Nairobi', description: 'City name of departure city' })
    from_city_name: string;

    @ValidateIf(o => isNullOrEmpty(o.to_group_id))
    @IsString()
    @ApiProperty({ required: true, example: 'Kampala', description: 'City name of destination city' })
    to_city_name: string;

    @IsOptional()
    @IsInt()
    @Validate(CityGroupIdValidation)
    @ApiProperty({ required: false, example: 234, description: 'Group City ID of source city' })
    from_group_id: number;

    @IsOptional()
    @IsInt()
    @Validate(CityGroupIdValidation)
    @ApiProperty({ required: false, example: 34, description: 'Group City ID of destination city' })
    to_group_id: number;

    @IsNotEmpty()
    @IsString()
    @ApiProperty({ required: true, example: new Helpers().yyyymmdd(5), description: 'Departure date from source city in format yyyymmdd' })
    outbound_date: string;

    @IsOptional()
    @IsString()
    @ApiProperty({ required: false, example: new Helpers().yyyymmdd(7), description: 'Arrival date from destination city in format yyyymmdd' })
    inbound_date: string;

    @IsOptional()
    @ApiProperty({ required: false, example: 'nigeria.quickbus.com', description: 'The application name from which the request is made' })
    app_name: string;

    @IsOptional()
    @IsString()
    @ApiProperty({ required: true, example: 'ZA', description: 'Country Identifier, please note this will override city_name & short_code' })
    country_code: string;

    @IsOptional()
    @ApiProperty({ required: false, example: ['34', '94'], description: 'Array of operator IDs' })
    operator_ids: Array<string>;

    @IsOptional()
    @ApiProperty({ required: false, example: ['Lagos - All', 'Abuja - All'], description: 'group city names to exclude' })
    from_city_excluded: Array<string>;

    @IsOptional()
    @ApiProperty({ required: false, example: ['Lagos - All', 'Abuja - All'], description: 'group city names to exclude' })
    to_city_excluded: Array<string>;

    @IsOptional()
    @ApiProperty({ example: 50, required: false, description: "Max distance between cities to allow" })
    max_distance: number;

    @IsOptional()
    @ApiProperty({ example: true, required: false, description: "Whether or not to return the actual searched route pair" })
    return_actual_route: boolean

    @IsOptional()
    @ApiProperty({ required: false, example: true, description: "set whether or not to clear cache" })
    clear_cache: boolean;
}

export class AlternativeRoutesResponse {
    @ApiProperty({ example: 'Lagos Iyana-Ipaja', description: 'Group City Name of destination city' })
    from_city_name: string;

    @ApiProperty({ example: 'Abuja Utako', description: 'Group City Name of arrival city' })
    to_city_name: string;

    @ApiProperty({ example: '3.28731350', description: 'Longitude of destination city' })
    from_longitude: string;

    @ApiProperty({ example: '7.44644020', description: 'Longitude of arrival city' })
    to_longitude: string;

    @ApiProperty({ example: '6.60962260', description: 'Latitude of destination city' })
    from_latitude: string;

    @ApiProperty({ example: '9.06785110', description: 'Latitude of arrival city' })
    to_latitude: string;

    @ApiProperty({ example: '12km', description: 'Distance in km away from the destination city' })
    from_city_distance: string;

    @ApiProperty({ example: '5.35km', description: 'Distance in km away from the arrival city' })
    to_city_distance: string;

    @ApiProperty({ example: 300, required: true, description: 'Bus fare' })
    user_fare: number;

    @ApiProperty({ example: 'N', required: true, description: 'currency symbol' })
    currency_symbol: string;
}

export class InventoryAlternativeRoutes {
    @ApiProperty({ required: false, example: [] })
    actual_route: Array<object>;

    @ApiProperty({ type: () => AlternativeRoutesResponse, isArray: true })
    from_routes: AlternativeRoutesResponse[];

    @ApiProperty({ type: () => AlternativeRoutesResponse, isArray: true })
    to_routes: AlternativeRoutesResponse[];

    @ApiProperty({ type: () => AlternativeRoutesResponse, isArray: true })
    other_routes: AlternativeRoutesResponse[];
}

export class InventoryAlternativeRoutesResponse {
    @ApiProperty({ type: () => InventoryAlternativeRoutes })
    outbound: InventoryAlternativeRoutes;

    @ApiProperty({ type: () => InventoryAlternativeRoutes })
    inbound: InventoryAlternativeRoutes;
}

