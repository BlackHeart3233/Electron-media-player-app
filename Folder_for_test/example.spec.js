const { test, expect, _electron: electron } = require('@playwright/test')

test('filter by title', async () =>{
    const app = await electron.launch({ args: ['index.js'] })
    const window = await app.firstWindow()
    await window.fill('#search_input', 'intel')
    const items = await window.locator('.video-item').count()
    expect(items).toBe(1)
    await app.close()
})

test('ascending sort by year', async () =>{
    const app = await electron.launch({ args: ['index.js'] })
    const window = await app.firstWindow()
    await window.selectOption('#sort_type', 'year')
    await window.selectOption('#sort_direction', 'asc')
    const firstItemYear = await window.locator('.video-item').first().textContent()
    expect(firstItemYear).toContain('1900')
    await app.close()
})

test('descending sort by year', async () =>{
    const app = await electron.launch({ args: ['index.js'] })
    const window = await app.firstWindow()
    await window.selectOption('#sort_type', 'year')
    await window.selectOption('#sort_direction', 'desc')
    const firstItemYear = await window.locator('.video-item').first().textContent()
    expect(firstItemYear).toContain('2003')
    await app.close()
})

test('theme change', async () => {
    const app = await electron.launch({ args: ['index.js'] })
    const window = await app.firstWindow()
    await window.click('#setting_BTN')
    const settingWindow = await app.waitForEvent('window')
    await settingWindow.click('#dark_theme')
    await expect(
        window.locator('#theme_id')
    ).toHaveAttribute('href', 'index_dark.css')
    await app.close()
})

test('play video', async () => {
    const app = await electron.launch({ args: ['index.js'] })
    const window = await app.firstWindow()
    await window.locator('.video-item').first().click()
    const VideoSrcName = await window.locator('#video-player').first().getAttribute('src')
    expect(VideoSrcName).not.toBeNull()
    await app.close()
})
