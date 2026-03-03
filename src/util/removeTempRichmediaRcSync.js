import fs from 'fs';

export default function removeTempRichmediaRc(configs) {
  configs.forEach(config => {
    if (!config.settings.willBeDeletedAfterServerCloses) {
      return
    }
    
    try {
      const fileData = fs.readFileSync(config.settings.location, {encoding: 'utf8'});
      const fileDataJson = JSON.parse(fileData);

      if (config.settings.uniqueHash === fileDataJson.uniqueHash) {
        fs.unlinkSync(config.settings.location);
      }
    } catch (e) {
      console.log(e);
    }
  })
};
