export const encode = str => Buffer.from(str).toString('base64');
export const decode = str => Buffer.from(str, 'base64').toString('utf8');
