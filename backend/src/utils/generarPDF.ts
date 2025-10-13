import puppeteer from 'puppeteer';
import { PaperFormat } from 'puppeteer';

export async function generarPDFDesdeHTML(html: string): Promise<Buffer> {
    const browser = await puppeteer.launch({
        headless: true,
        args: ['--no-sandbox', '--disable-setuid-sandbox'],
    });

    const page = await browser.newPage();
    await page.setContent(html, { waitUntil: 'networkidle0' });

    const pdfBuffer = (await page.pdf({
        format: 'a4',
        printBackground: true,
    })) as unknown as Buffer;



    await browser.close();
    return pdfBuffer;
}
