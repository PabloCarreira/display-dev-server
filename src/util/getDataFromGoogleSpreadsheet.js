import getGoogleSheetIdFromUrl from './getGoogleSheetIdFromUrl.js';
import chalk from 'chalk';
import { GoogleSpreadsheet } from 'google-spreadsheet';
import isGoogleSpreadsheetUrl from './isGoogleSpreadsheetUrl.js';
import getOAuth2Client from './getOAuth2Client.js';

export default async function getDataFromGoogleSpreadsheet(contentSource) {
  const cacheSpreadSheets = {};
  const id = getGoogleSheetIdFromUrl(contentSource.url);

  if (!isGoogleSpreadsheetUrl(contentSource.url)) {
    throw new Error('settings.contentSource.url is not a valid google spreadsheet url.');
  }

  console.log(`${chalk.green('✔')} gathering google sheets data for ${id}`);

  let doc;
  if (contentSource.hasOwnProperty('apiKey') || process.env.displayMonks_googleApiKey) {
    console.log(`${chalk.green('✔')} using API key`);
    const apiKey = contentSource.apiKey || process.env.displayMonks_googleApiKey;
    doc = new GoogleSpreadsheet(id, { apiKey });
  } else {
    console.log(`${chalk.green('✔')} no API key found, defaulting to OAuth2`);
    const oAuth2Client = await getOAuth2Client();
    doc = new GoogleSpreadsheet(id, oAuth2Client);
  }

  cacheSpreadSheets[id] = doc;
  await doc.loadInfo();
  let sheet;

  if (contentSource.tabName) {
    sheet = doc.sheetsByTitle[contentSource.tabName];

    if (!sheet) {
      console.log(
        `${chalk.green(
          '✔',
        )} Selecting first tab from sheet because tabName was incorrectly named (check tabNames in spreadsheet).`,
      );
      sheet = doc.sheetsByIndex[0];
    } else {
      console.log(`${chalk.green('✔')} Selecting "${contentSource.tabName}" from sheet.`);
    }
  } else {
    console.log(
      `${chalk.green('✔')} Selecting first tab from sheet because tabName was not defined.`,
    );
    sheet = doc.sheetsByIndex[0];
  }

  const rows = await sheet.getRows();
  const headerValues = sheet.headerValues;

  // Returning rows mapping data directly since v4 provides it via row.get('key') or row.toObject().
  // Assuming callers expect plain objects representing data rows rather than full GoogleSpreadsheetRow instances if backwards compatibility is strictly required. 
  // For safety, providing both raw rows and row data mapped into standard objects compatible with prior behavior.
  const mappedRows = rows.map(row => row.toObject());
  Object.defineProperty(mappedRows, 'raw', { value: rows });

  return {
    rows: mappedRows,
    headerValues
  };
}
