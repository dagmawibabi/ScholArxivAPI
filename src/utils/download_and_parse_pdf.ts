import { pdfBaseURL, tempPDFDirectory } from "../lib/constants";

import fs from "fs";
import path from "path";
import axios from "axios";
import pdfParser from "pdf-parse";

let downloadedPapersPath: string[] = [];

// Download PDFs
async function downloadBatchPDFs(papers: any[]) {
    // Create Temp folder
    const tempDir = path.join(__dirname, "..", tempPDFDirectory);
    if (!fs.existsSync(tempDir)) {
        fs.mkdirSync(tempDir);
    }

    for (let paper of papers) {
        const pdfURL = `${pdfBaseURL}/${paper.extractedID}.pdf`;
        const pdfPath = path.join(tempDir, `${paper.extractedID}.pdf`);
        await downloadPDF(pdfURL, pdfPath);
    }
}

//
async function downloadPDF(pdfURL: string, pdfPath: string) {
    const writer = fs.createWriteStream(pdfPath);

    try {
        const response = await axios({
            method: "get",
            url: pdfURL,
            responseType: "stream",
        });

        // Pipe the response data to the file stream
        response.data.pipe(writer);

        return new Promise((resolve, reject) => {
            writer.on("finish", resolve);
            writer.on("error", reject);
        });
    } catch (error: any) {
        console.error("Error downloading the file:", error.message);
    }
}

// Parse PDF
async function parsePDF() {
    for (let eachPath of downloadedPapersPath) {
        let dataBuffer = fs.readFileSync(eachPath);

        await pdfParser(dataBuffer).then((data: any) => {
            // number of pages
            console.log(data.numpages);
            // number of rendered pages
            // console.log(data.numrender);
            // PDF info
            // console.log(data.info);
            // PDF metadata
            // console.log(data.metadata);
            // PDF.js version
            // console.log(data.version);
            // PDF text
            // console.log(data.text);
        });
    }
}

async function downloadAndParsePDF(papers: any[]) {
    await downloadBatchPDFs(papers);
    await parsePDF();
    downloadedPapersPath = [];
}

export default downloadAndParsePDF;
