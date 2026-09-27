import { chromium } from "playwright";

const url =
  "https://discoveryprovider.audius.co/v1/oauth/authorize" +
  "?scope=read&state=probe" +
  "&redirect_uri=" + encodeURIComponent("https://mybeats.gaganpallai.in/oauth/callback") +
  "&response_mode=query" +
  "&api_key=0x8a3109a1768d8dfa7e6a2db81bcf2af3351eb37b" +
  "&response_type=code&code_challenge=E9Melhoa2OwvFrEMTJguCHaoeK1t8URWbuGJSstw-cM&code_challenge_method=S256&display=fullScreen";

const browser = await chromium.launch();
const page = await browser.newPage({ viewport: { width: 420, height: 860 } });
await page.goto(url, { waitUntil: "networkidle", timeout: 60000 });
await page.waitForTimeout(3000);

const info = await page.evaluate(() => {
  const text = document.body.innerText;
  const buttons = [...document.querySelectorAll("button, a, [role=button]")]
    .map((b) => (b.innerText || b.getAttribute("aria-label") || "").trim())
    .filter(Boolean)
    .slice(0, 25);
  return { url: location.href, title: document.title, textSample: text.slice(0, 500), buttons };
});
console.log(JSON.stringify(info, null, 2));
await page.screenshot({ path: "C:/Users/ASUS/AppData/Local/Temp/claude/oauth-screen.png", fullPage: true });
await browser.close();
