import { TinyPNG } from 'tinypng';

export default async function (content) {
  const callback = this.async();
  const options = this.getOptions();
  const {apiKey} = options;

  const client = new TinyPNG(apiKey);
  const file = await client.compress(content);
  callback(null, file.data);
};

export const raw = true;
