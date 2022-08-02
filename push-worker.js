self[`appKey`] = `c4f5c9ab25dcb2e784f72e791b4d1f35`;
self[`hostUrl`] = `https://cdn.gravitec.net/sw`;
self.importScripts(`${self[`hostUrl`]}/worker.js`);
// uncomment and set path to your service worker
// if you have one with precaching functionality (has oninstall, onactivate event listeners)
self.importScripts('./sw.js')
