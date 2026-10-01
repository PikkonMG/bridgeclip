const test = require('node:test')
const assert = require('node:assert/strict')
const fs = require('node:fs')
const os = require('node:os')
const path = require('node:path')
const { buildApp, launchApp } = require('../zernio/support/electron-app.cjs')

test('on a Linux desktop Chromium does not recognise, keys go to the Secret Service keyring, not plaintext', { skip: process.platform !== 'linux' && 'Linux key storage', timeout: 90000 }, async (t) => {
  const root = fs.mkdtempSync(path.join(os.tmpdir(), 'bridgeclip-key-storage-e2e-'))
  const appDir = buildApp(path.join(root, 'app'))
  const session = await launchApp({ appDir, userDataDir: path.join(root, 'user-data'), env: { XDG_CURRENT_DESKTOP: 'sway', DESKTOP_SESSION: 'sway', KDE_FULL_SESSION: '' } })
  t.after(async () => { await session.close(); fs.rmSync(root, { recursive: true, force: true }) })
  // Without BridgeClip's choice, Chromium selects basic_text on sway.
  assert.equal(await session.app.evaluate(({ safeStorage }) => safeStorage.getSelectedStorageBackend()), 'gnome_libsecret')
})
