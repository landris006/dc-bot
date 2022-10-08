import fs from 'fs/promises';

export const logger = async (message: string) => {
  const files = await fs.readdir(process.cwd());
  const logFile = files.find((file) => file === '.log');

  const log = `[${new Date().toLocaleString()}]
    ${message}`;

  console.log(log);

  if (!logFile) {
    return fs.writeFile('.log', `${log}\n`);
  }
  return fs.appendFile('.log', `${log}\n`);
};
