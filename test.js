const path = require('path');
const bookmark = require('./bookmark');
const fs = require('fs');


// chromeDataDir = path.join(window.utools.getPath('appData'), 'Google/Chrome')
// edgeDataDir = "/Users/yfeng/Library/Application Support/Microsoft Edge"
edgeDataDir = '/home/corvo/.config/microsoft-edge'

// bookmarksDataCache.push(...getBookmarks(chromeDataDir, 'chrome'))
// console.log(bookmark.getBookmarks(edgeDataDir, 'edge'));
console.log(bookmark.searchForEdge());

// bookmark.getBookmarks(edgeDataDir, 'edge');

// const icon = path.join(edgeDataDir, 'Default', 'Edge Profile Picture.png')
// const contents = fs.readFileSync(icon, { encoding: 'base64' });
// console.log(contents);