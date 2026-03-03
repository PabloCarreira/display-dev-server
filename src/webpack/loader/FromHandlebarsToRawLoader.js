export default function FromHandlebarsToRawLoader(content, sourceMap) {
  const callback = this.async();
  const options = this.getOptions();
  const { configLoaderName } = options;

  const bla = `
module.exports = function(){

  const config = require("${configLoaderName}");
  const exec = `;

  content = content.replace("module.exports = ", bla)
  content += `
return exec(config); }`;

  callback(null, content);
};
