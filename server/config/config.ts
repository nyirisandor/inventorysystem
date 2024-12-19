import dotenv from 'dotenv';
dotenv.config();


type ConfigType =  {
    db : {
        host? : string,
        user? : string,
        password? : string,
        database? : string,
        port? : number
    },
    jwt: {
        secret : string,
        expiration : number|string
    },
    server : {
        port : number
    }
};

const getEnv = (key: string, defaultValue?: string) : string => {
    const value = process.env[key];
    if (!value && !defaultValue) {
      throw new Error(`Missing required environment variable: ${key}`);
    }
    return value || defaultValue!;
};

const config : ConfigType = {
  db: {
    host: process.env.DB_HOST,
    user: process.env.DB_USER,
    password: process.env.DB_PASS,
    database: process.env.DB_NAME,
    port: process.env.DB_PORT ? Number.parseInt(process.env.DB_PORT) : undefined
  },
  jwt: {
    secret: getEnv('JWT_SECRET'),
    expiration: getEnv('JWT_EXPIRATION','7d'),
  },
  server: {
    port: parseInt(getEnv('SERVER_PORT','3000'), 10),
  },
};


export default config