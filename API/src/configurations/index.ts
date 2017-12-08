import * as nconf from 'nconf';
import * as path from 'path';

// Read Configurations
const configs = new nconf.Provider({
  env: true,
  argv: true,
  store: {
    type: 'file',
    file: path.join(__dirname, `./config.${process.env.NODE_ENV || 'dev'}.json`)
  }
});

export interface IServerConfigurations {
    port: number;
    plugins: string[];
    jwtSecret: string;
    jwtExpiration: string;
    routePrefix: string;
}

export interface IDataConfiguration {
    connectionString: string;
}

export interface IOAuthConfiguration {  
    tenantId: string;  
    applicationId: string;  
    clientId: string;  
    clientSecret: string;  
    identityMetadata: string;  
    responseType: string;  
    responseMode: string;  
    redirectUrl: string;  
    allowHttpForRedirectUrl: boolean;  
    validateIssuer: boolean;  
    isB2C: boolean;  
    issuer: boolean;  
    passReqToCallback: boolean;  
    useCookieInsteadOfSession: boolean;  
    cookieEncryptionKeys: object;  
}

export function getDatabaseConfig(): IDataConfiguration {
    return configs.get('database');
}

export function getServerConfigs(): IServerConfigurations {
    return configs.get('server');
}

export function getOAuthConfigs(): IOAuthConfiguration {  
    return configs.get('oAuth');  
}  
