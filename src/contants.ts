
export const AppConstants = {
    SQL: {
        GET_CITY_GROUP_NAME: `SELECT name FROM tbl_cities_groups WHERE id = ?`,
        GET_LAT_LNG: `SELECT latitude, longitude FROM tbl_cities_groups WHERE name = ?`,
        GET_FROM_ROUTES: `SELECT ucase(tcg.name) as from_city_name, ucase(tcg2.name) as to_city_name, tcg.latitude AS latitude, tcg.longitude AS longitude
        FROM tbl_route_pair_active trpa
        INNER JOIN tbl_cities_groups tcg ON trpa.from_group_city_id = tcg.id
        INNER JOIN tbl_cities_groups tcg2 ON trpa.to_group_city_id = tcg2.id
        WHERE (?)
        AND from_group_city_name not in (SELECT name FROM tbl_cities_groups where date_ceased is not null AND date_ceased != '0000-00-00 00:00:00')
        AND to_group_city_name not in (SELECT name FROM tbl_cities_groups where date_ceased is not null AND date_ceased != '0000-00-00 00:00:00')
        GROUP BY concat(from_group_city_name,' to ', to_group_city_name)`,
        GET_TO_ROUTES: `SELECT ucase(tcg.name) as from_city_name, ucase(tcg2.name) as to_city_name, tcg2.latitude AS latitude, tcg2.longitude AS longitude
        FROM tbl_route_pair_active trpa
        INNER JOIN tbl_cities_groups tcg ON trpa.from_group_city_id = tcg.id
        INNER JOIN tbl_cities_groups tcg2 ON trpa.to_group_city_id = tcg2.id
        WHERE (?)
        AND from_group_city_name not in (SELECT name FROM tbl_cities_groups where date_ceased is not null AND date_ceased != '0000-00-00 00:00:00')
        AND to_group_city_name not in (SELECT name FROM tbl_cities_groups where date_ceased is not null AND date_ceased != '0000-00-00 00:00:00')
        GROUP BY concat(from_group_city_name,' to ', to_group_city_name)`,
        GET_OTHER_ROUTES: `select ucase(tcg1.name) as from_city_name , ucase(tcg2.name) as to_city_name,
        tcg1.latitude as latitude, tcg1.longitude as longitude, tcg2.latitude as to_latitude, tcg2.longitude as to_longitude
        FROM tbl_route_pair_active trpa
        join tbl_cities_groups tcg1 on trpa.from_group_city_id = tcg1.id
        join tbl_cities_groups tcg2 on trpa.to_group_city_id = tcg2.id
        WHERE (?)
        AND from_group_city_name not in (SELECT name FROM tbl_cities_groups where date_ceased is not null AND date_ceased != '0000-00-00 00:00:00')
        AND to_group_city_name not in (SELECT name FROM tbl_cities_groups where date_ceased is not null AND date_ceased != '0000-00-00 00:00:00')
        GROUP BY concat(trpa.from_group_city_name,' to ', trpa.to_group_city_name);`,
        GET_ACTUAL_ROUTE: `SELECT ucase(tcg.name) as from_city_name, ucase(tcg2.name) as to_city_name, cheapest_price as user_fare, currency_symbol
        FROM tbl_route_summary trs 
        INNER JOIN tbl_cities_groups tcg ON trs.from_group_city_id = tcg.id
        INNER JOIN tbl_cities_groups tcg2 ON trs.to_group_city_id = tcg2.id
        WHERE from_group_city_name = ? AND to_group_city_name = ? AND travel_date = ?`,
        GET_AMOUNT_FOR_ROUTE_PAIR: `SELECT currency_symbol, cheapest_price FROM tbl_route_summary 
                      WHERE travel_date = ? and from_group_city_name = ? and to_group_city_name = ?`,
    },

    Messages: {
        INVALID_CITY_ID: 'City does not exist',
    },

    CACHE_KEYS: {
        ALTERNATIVE_ROUTES_PREFIX: 'GetAlternativeRoutes_'
    },
}