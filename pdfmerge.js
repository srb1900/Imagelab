document.addEventListener("DOMContentLoaded", function () {

    const uploadBox = document.getElementById("uploadBox");
    const fileInput = document.getElementById("fileInput");

    let selectedPDFs = [];
    let pdfURL = null;

    // Action Area
    const actionArea = document.createElement("div");
    actionArea.style.cssText = "margin-top:25px;text-align:center;width:100%;";
    uploadBox.parentNode.insertBefore(actionArea, uploadBox.nextSibling);

    /* ================= EVENTS ================= */

    uploadBox.addEventListener("click", () => {
        fileInput.accept = "application/pdf";
        fileInput.multiple = true;
        fileInput.click();
    });

    fileInput.addEventListener("change", function () {

        const files = Array.from(this.files);

        selectedPDFs = files.filter(f => f.type === "application/pdf");

        if (selectedPDFs.length === 0) {
            alert("Only PDF files allowed!");
            return;
        }

        showFileNames();
        showMergeButton();
    });

    /* ================= SHOW FILE NAMES ================= */

    function showFileNames() {

        let html = `<div style="padding:15px;text-align:left;">`;

        selectedPDFs.forEach((file, index) => {
            html += `
                <p style="
                    font-size:14px;
                    margin:6px 0;
                    padding:6px 10px;
                    background:rgba(255,255,255,0.05);
                    border-radius:8px;
                ">
                    ${index + 1}. ${file.name}
                </p>
            `;
        });

        html += `</div>`;

        uploadBox.innerHTML = html;
    }

    /* ================= MERGE ================= */

    async function mergePDFs() {

        const { PDFDocument } = PDFLib;
        const merged = await PDFDocument.create();

        actionArea.innerHTML = "<p>Processing...</p>";

        for (let file of selectedPDFs) {
            const bytes = await file.arrayBuffer();
            const pdf = await PDFDocument.load(bytes);

            const pages = await merged.copyPages(pdf, pdf.getPageIndices());
            pages.forEach(p => merged.addPage(p));
        }

        const mergedBytes = await merged.save();

        const blob = new Blob([mergedBytes], { type: "application/pdf" });

        if (pdfURL) URL.revokeObjectURL(pdfURL);
        pdfURL = URL.createObjectURL(blob);

        showDownloadButtons();
    }

    /* ================= BUTTONS ================= */

    function showMergeButton() {
        actionArea.innerHTML = "";
        actionArea.appendChild(createBtn("Merge PDFs", "#4f46e5", mergePDFs));
    }

    function showDownloadButtons() {
        actionArea.innerHTML = "";

        const downloadBtn = createBtn("Download PDF", "#10b981", function () {

            const now = new Date();
            const pad = (n) => n.toString().padStart(2, "0");

            const fileName = `merged_${now.getFullYear()}${pad(now.getMonth()+1)}${pad(now.getDate())}_${pad(now.getHours())}${pad(now.getMinutes())}${pad(now.getSeconds())}.pdf`;

            const link = document.createElement("a");
            link.href = pdfURL;
            link.download = fileName;
            link.click();
        });

        const resetBtn = createBtn("Reset", "#6b7280", function () {

            selectedPDFs = [];
            pdfURL = null;

            fileInput.value = "";

            uploadBox.innerHTML = `
                <div class="upload-icon">
                    <img src="up.svg" alt="">
                </div>
                <p class="primary-text">Drop pdfs here or click to browse</p>
                <p class="secondary-text">pdf</p>
            `;

            actionArea.innerHTML = "";
        });

        actionArea.appendChild(downloadBtn);
        actionArea.appendChild(resetBtn);
    }

    function createBtn(text, color, action) {
        const btn = document.createElement("button");
        btn.innerText = text;
        btn.style.cssText = `
            padding:12px 20px;
            margin:6px;
            border:none;
            border-radius:8px;
            color:white;
            cursor:pointer;
            background:${color};
            font-weight:bold;
        `;
        btn.onclick = action;
        return btn;
    }

});