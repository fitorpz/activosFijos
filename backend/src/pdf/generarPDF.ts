import puppeteer from 'puppeteer';

export async function generarPDFDesdeHTML(html: string): Promise<Buffer> {

    const browser = await puppeteer.launch({
        headless: true,
        args: ['--no-sandbox', '--disable-setuid-sandbox'], // 🔐 útil para Windows y entornos restringidos
    });

    const page = await browser.newPage();
    await page.setContent(html, { waitUntil: 'networkidle0' });

    const pdfBuffer = await page.pdf({
        format: 'a4',
        printBackground: true,
    });

    await browser.close();
    return Buffer.from(pdfBuffer as Uint8Array);

}
