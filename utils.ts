const notifier = require('node-notifier');

export function prefix(id?: string) {
  const now = new Date();
  return `${now.toISOString()}${separator}${id ? id + separator : ""}`
}

export function verbose(...params: any[]) {
  opts.verbose ? console.log(...params) : undefined;
}

export function puts(...params: any[]) {
  console.log(prefix(), ...params);
}

export function notify(message: { message: string, title?: string }, level?: string, logMethod?: Function) {
  notifier.notify(message);
  if (level === LEVEL_ERROR && logMethod) {
    logMethod(chalk.red(message.message));
  }
};
