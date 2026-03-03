const reg = /^https?:\/\//;

function isExternalURL(url) {
  return reg.test(url);
}

export default isExternalURL;
