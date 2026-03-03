export default async function (content) {
  const callback = this.async();
  console.log(content.toString('utf-8'))
  callback(null, content);
};

export const raw = true;
