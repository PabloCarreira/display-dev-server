import fs from 'fs-extra';

export default async function removeTempRichmediaRc(configs) {
  await Promise.all(
    configs.map(async config => {
      if (!config.settings.willBeDeletedAfterServerCloses) {
        return
      }
      
      if (!(await fs.exists(config.settings.location))) {
        return
      }

      const fileData = await fs.readFile(config.settings.location, {encoding: 'utf8'});
      const fileDataJson = JSON.parse(fileData);

      if (config.settings.uniqueHash === fileDataJson.uniqueHash) {
        await fs.unlink(config.settings.location);
      }
    })
  )
};
