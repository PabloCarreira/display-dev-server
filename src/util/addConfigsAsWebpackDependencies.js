import fs from 'fs-extra';
import path from 'path';

export default function addConfigsAsWebpackDependencies(filePath, loaderContext) {
  loaderContext.addDependency(filePath);

  try {
    const rawConfigJson = fs.readJSONSync(filePath);

    if (rawConfigJson.parent) {
      const newPath = path.resolve(path.dirname(filePath), rawConfigJson.parent);
      addConfigsAsWebpackDependencies(newPath, loaderContext);
    }

  } catch (e) {

  }
}
