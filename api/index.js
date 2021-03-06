const fs = require('fs')
const path = require('path')

const pathToImage = path.resolve(process.cwd(), 'assets/500-bad-request.png')
const badRequestImage = fs.readFileSync(pathToImage)

module.exports = async (req, res) => {
  // if url is undefined then send 500 bad request image
  if (typeof req.query.url === 'undefined') {
    res.setHeader('Content-Type', 'image/png')
    res.send(badRequestImage)
    return
  }

  try {
    const url = new URL(req.query.url)
    const chrome = require('chrome-aws-lambda')
    const puppeteer = require('puppeteer')
    const browser = await puppeteer.launch({
      args: chrome.args,
      executablePath: await chrome.executablePath,
      headless: chrome.headless,
    })
    const page = await browser.newPage()
    await page.goto(url)
    const capturedImage = await page.screenshot({
      type: 'jpeg',
      quality: 100,
      fullPage: false,
    })
    await browser.close()

    res.setHeader('Content-Type', 'image/jpeg')
    res.send(capturedImage)
  } catch (err) {
    console.error('[err]', err)
    res.setHeader('Content-Type', 'image/png')
    res.send(badRequestImage)
    return
  }
}
