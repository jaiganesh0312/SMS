const puppeteer = require("puppeteer");
const fs = require("fs");
const path = require("path");

exports.generatePDF = async (htmlContent, options = {}) => {
    let browser;
    try {
        browser = await puppeteer.launch({
            headless: "new",
            args: ["--no-sandbox", "--disable-setuid-sandbox"],
        });
        const page = await browser.newPage();

        // Set content
        await page.setContent(htmlContent, {
            waitUntil: "networkidle0",
        });

        // Generate PDF
        const pdfBuffer = await page.pdf({
            format: "A4",
            printBackground: true,
            margin: {
                top: "20px",
                right: "20px",
                bottom: "20px",
                left: "20px",
            },
            ...options,
        });

        return pdfBuffer;
    } catch (error) {
        throw error;
    } finally {
        if (browser) {
            await browser.close();
        }
    }
};
