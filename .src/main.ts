import requireAll from "require-all";
import dayjs from "dayjs";

import utc from "dayjs/plugin/utc";

dayjs.extend(utc);

async function init(): Promise<void> {
    console.debug("Loading Functions...");

    const functionDir: string = `${__dirname}/functions`;
    console.debug(`Functions directory: ${functionDir}`);

    const startTime: number = Date.now();
    requireAll({
        dirname: functionDir,
        recursive: true,
        filter: /^(?:(?!\.test\.js$).)*.js$/ // All .js files except .test.js files
    });

    const totalDuration: number = Date.now();
    console.debug(`Loaded all functions in ${totalDuration - startTime}ms`);
}


init()
    .catch((error: unknown) => {
        console.error(error);
        process.exit(1);
    });