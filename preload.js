const path = require('path')
const fs = require('fs')
const cp = require('child_process')
const bookmark = require('./bookmark');
let bookmarksDataCache = null


window.exports = {
    'bookmarks-search': {
        mode: 'list',
        args: {
            enter: (action, callbackSetList) => {
                bookmarksDataCache = []
                let chromeDataDir
                let edgeDataDir
                if (process.platform === 'win32') {
                    chromeDataDir = path.join(process.env.LOCALAPPDATA, 'Google/Chrome/User Data')
                    edgeDataDir = path.join(process.env.LOCALAPPDATA, 'Microsoft/Edge/User Data')
                } else if (process.platform === 'darwin') {
                    chromeDataDir = path.join(window.utools.getPath('appData'), 'Google/Chrome')
                    edgeDataDir = path.join(window.utools.getPath('appData'), 'Microsoft Edge')
                } else { return }
                if (fs.existsSync(chromeDataDir)) {
                    bookmarksDataCache.push(...bookmark.getBookmarks(chromeDataDir, 'chrome'))
                }
                if (fs.existsSync(edgeDataDir)) {
                    bookmarksDataCache.push(...bookmark.getBookmarks(edgeDataDir, 'edge'))
                }
                if (bookmarksDataCache.length > 0) {
                    bookmarksDataCache = bookmarksDataCache.sort((a, b) => a.addAt - b.addAt)
                }
            },
            search: (action, searchWord, callbackSetList) => {
                searchWord = searchWord.trim()
                if (!searchWord) return callbackSetList()
                if (/\S\s+\S/.test(searchWord)) {
                    const regexTexts = searchWord.replace(/[.*+?^${}()|[\]\\]/g, '\\$&').split(/\s+/)
                    const searchRegexs = regexTexts.map(rt => new RegExp(rt, 'i'))
                    return callbackSetList(bookmarksDataCache.filter(x => (!searchRegexs.find(r => x.title.search(r) === -1) || !searchRegexs.find(r => x.description.search(r) === -1))))
                } else {
                    const regexText = searchWord.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')
                    const searchRegex = new RegExp(regexText, 'i')
                    return callbackSetList(bookmarksDataCache.filter(x => (
                        x.title.search(searchRegex) !== -1 || x.description.search(searchRegex) !== -1
                    )))
                }
            },
            select: (action, itemData) => {
                window.utools.hideMainWindow(false)
                if (itemData.browser === 'chrome') {
                    bookmark.openUrlByChrome(itemData)
                } else {
                    bookmark.openUrlByEdge(itemData)
                }
                window.utools.outPlugin()
            }
        }
    }
}