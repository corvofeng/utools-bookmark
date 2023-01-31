const path = require('path');
const fs = require('fs');
const cp = require('child_process');

function getBookmarks(dataDir, browser) {
    const profiles = ['Default', 'Profile 3', 'Profile 2', 'Profile 1'];
    let bookmarksData = [];
    profiles.forEach(profile => {
        if (!fs.existsSync(path.join(dataDir, profile, 'Bookmarks'))) {
            return;
        }
        const bookmarkPath = path.join(dataDir, profile, 'Bookmarks');
        const icon = browser + '.png';
        // const icon = path.join(dataDir, profile, 'Edge Profile Picture.png');
        // const iconContents = fs.readFileSync(icon, { encoding: 'base64' });
        let loginUser = null;
        let profileBookmark = [];
        try {
            const data = JSON.parse(fs.readFileSync(bookmarkPath, 'utf-8'));
            const getUrlData = (item, folder) => {
                if (!item || !Array.isArray(item.children)) return
                item.children.forEach(c => {
                    if (c.type === 'url') {
                        if (c.url.startsWith('mailto:') && c.name === 'Profile') {
                            loginUser = c.url.split(':')[1];
                        }
                        profileBookmark.push({
                            addAt: parseInt(c.date_added),
                            title: c.name || '',
                            description: (folder ? '「' + folder + '」' : '') + c.url,
                            url: c.url,
                            profile,
                            browser,
                            icon,
                        })
                    } else if (c.type === 'folder') {
                        getUrlData(c, folder ? folder + ' - ' + c.name : c.name)
                    }
                })
            }
            getUrlData(data.roots.bookmark_bar, '')
            getUrlData(data.roots.other, '')
            getUrlData(data.roots.synced, '')
        } catch (e) {}
        profileBookmark.forEach(item => {
            item.description = loginUser + ' - ' + item.description;
        });
        bookmarksData = bookmarksData.concat(profileBookmark);
        // console.log(loginUser);
    });
    return bookmarksData
}

function openUrlByChrome(item) {
    const url = item.url;
    if (process.platform === 'win32') {
        const suffix = `${path.sep}Google${path.sep}Chrome${path.sep}Application${path.sep}chrome.exe`
        const prefixes = [process.env['PROGRAMFILES(X86)'], process.env.PROGRAMFILES, process.env.LOCALAPPDATA].filter(Boolean)
        const prefix = prefixes.find(prefix => fs.existsSync(path.join(prefix, suffix)))
        const chromeApp = path.join(prefix, suffix)
        if (chromeApp) {
            cp.spawn(chromeApp, [url], { detached: true })
        } else {
            window.utools.shellOpenExternal(url)
        }
        return
    }
    if (process.platform === 'darwin') {
        const chromeApp = '/Applications/Google Chrome.app'
        if (fs.existsSync(chromeApp)) {
            cp.spawn('open', ['-a', chromeApp, url], { detached: true })
        } else {
            window.utools.shellOpenExternal(url)
        }
    }
}

function openUrlByEdge(item) {
    const url = item.url;
    const profile = item.profile;
    if (process.platform === 'win32') {
        const args = ['shell:AppsFolder\\Microsoft.MicrosoftEdge_8wekyb3d8bbwe!MicrosoftEdge']
        args.push(url)
        cp.spawn('start', args, { shell: 'cmd.exe', detached: true }).once('error', () => {
            window.utools.shellOpenExternal(url)
        })
        return
    }
    if (process.platform === 'darwin') {
        const edgeApp = '/Applications/Microsoft Edge.app'
        if (fs.existsSync(edgeApp)) {
            // cp.spawn('open', ['-a', edgeApp, url, '--args', `--profile=${profile}`], { detached: true })
            cp.spawn("/Applications/Microsoft Edge.app/Contents/MacOS/Microsoft Edge", [`--profile-directory=${profile}`, url])
        } else {
            window.utools.shellOpenExternal(url)
        }
    }
}
module.exports = {
    getBookmarks,
    openUrlByChrome,
    openUrlByEdge
}