import fs from 'fs';

export default function isFile(val) {
  if (typeof val === 'string' && fs.existsSync(val) && fs.statSync(val).isFile()) {
    return true;
  } else {
    return false;
  }
};