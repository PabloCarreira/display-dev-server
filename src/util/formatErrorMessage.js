/**
 *
 * @param {keyword: string, dataPath, schemaPath,params,message} error
 */
export default function formatErrorMessage(error) {
  let result = '';

  result += `${error.dataPath.substr(1)} ${error.message}`;
  return result;
};
