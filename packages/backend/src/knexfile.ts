/**
 * Switch behaviour of database connector depending on environment
 */
import { Knex } from 'knex';
import path from 'path';
import { parse } from 'pg-connection-string';
import { lightdashConfig } from './config/lightdashConfig';

const CONNECTION = lightdashConfig.database.connectionUri
    ? parse(lightdashConfig.database.connectionUri)
    : {};

// Condition to be removed once we require Postgres vector extension
const hasEnterpriseLicense = !!lightdashConfig.license.licenseKey;

const development: Knex.Config<Knex.PgConnectionConfig> = {
    client: 'pg',
    connection: CONNECTION,
    pool: {
        min: lightdashConfig.database.minConnections || 0,
        max: lightdashConfig.database.maxConnections || 10,
    },
    migrations: {
        directory: [
            path.join(__dirname, './database/migrations'),
            ...(hasEnterpriseLicense
                ? [path.join(__dirname, './ee/database/migrations')]
                : []),
        ],
        tableName: 'knex_migrations',
        extension: 'ts',
        loadExtensions: ['.ts'],
    },
    seeds: {
        directory: [
            path.join(__dirname, './database/seeds/development'),
            ...(hasEnterpriseLicense
                ? [path.join(__dirname, './ee/database/seeds/development')]
                : []),
        ],
        loadExtensions: ['.ts'],
    },
};

const production: Knex.Config<Knex.PgConnectionConfig> = {
    ...development,
    migrations: {
        ...development.migrations,
        loadExtensions: ['.js'],
    },
    seeds: {
        ...development.seeds,
        loadExtensions: ['.js'],
    },
};

export default {
    development,
    production,
};
