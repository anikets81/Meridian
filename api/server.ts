import { config } from 'dotenv';
import App from './src/App';
import { Database } from './src/modules/db';
import { AppEnvSchema } from './src/types/app.types';

config({ override: true });

const valid = AppEnvSchema.safeParse(process.env);
if (!valid.success) {
    const details = valid.error.issues
        .map((issue) => `  - ${issue.path.join('.') || '(root)'}: ${issue.message}`)
        .join('\n');
    console.error(`Invalid environment variables:\n${details}`);
    throw new Error('Invalid environment variables');
}

const port = Number(process.env.APP_PORT || process.env.PORT) || 1401;

const app = new App(port);

app.listen();

Database.getInstance().testDBConnection();

export const viteNodeApp = app.app;
