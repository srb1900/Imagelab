document.addEventListener("DOMContentLoaded", function () {

    const uploadBox = document.getElementById("uploadBox");
    const fileInput = document.getElementById("fileInput");

    let selectedImages = [];
    let generatedPDF = null;
    let pdfURL = null;

    // Action Area
    const actionArea = document.createElement("div");
    actionArea.style.cssText = "margin-top:25px;text-align:center;width:100%;";
    uploadBox.parentNode.insertBefore(actionArea, uploadBox.nextSibling);

    /* ================= EVENTS ================= */

    uploadBox.addEventListener("click", () => {
        if (!generatedPDF) {
            fileInput.accept = "image/*";
            fileInput.multiple = true;
            fileInput.click();
        }
    });

    fileInput.addEventListener("change", function () {

        if (this.files.length === 0) return;

        selectedImages = Array.from(this.files);

        showImagePreview(selectedImages[0]);
        showConvertButton();
    });

    /* ================= IMAGE PREVIEW ================= */

    function showImagePreview(file) {
        const reader = new FileReader();
        reader.onload = function (e) {
            uploadBox.innerHTML = `
                <img src="${e.target.result}" 
                style="width:100%;height:100%;object-fit:contain;border-radius:inherit;">
            `;
        };
        reader.readAsDataURL(file);
    }

    /* ================= PDF CONVERSION ================= */

    async function convertToPDF() {

        const { jsPDF } = window.jspdf;
        const pdf = new jsPDF("p", "mm", "a4");

        const pageWidth = pdf.internal.pageSize.getWidth();
        const pageHeight = pdf.internal.pageSize.getHeight();
        const margin = 10;

        actionArea.innerHTML = "<p>Processing...</p>";

        for (let i = 0; i < selectedImages.length; i++) {

            const imageData = await toBase64(selectedImages[i]);
            const img = await loadImage(imageData);

            const maxWidth = pageWidth - margin * 2;
            const maxHeight = pageHeight - margin * 2;

            let width = maxWidth;
            let height = (img.height * maxWidth) / img.width;

            if (height > maxHeight) {
                height = maxHeight;
                width = (img.width * maxHeight) / img.height;
            }

            const x = (pageWidth - width) / 2;
            const y = (pageHeight - height) / 2;

            if (i > 0) pdf.addPage();

            const format = selectedImages[i].type.includes("png") ? "PNG" : "JPEG";
            pdf.addImage(imageData, format, x, y, width, height);
        }

        generatedPDF = pdf;

        const blob = pdf.output("blob");

        if (pdfURL) URL.revokeObjectURL(pdfURL);
        pdfURL = URL.createObjectURL(blob);

        // Preview
        uploadBox.innerHTML = `
            <iframe 
                src="${pdfURL}#page=1&toolbar=0&navpanes=0&scrollbar=0"
                style="width:100%;height:450px;border:none;border-radius:inherit;">
            </iframe>
        `;

        showDownloadButtons();
    }

    /* ================= BUTTONS ================= */

    function showConvertButton() {
        actionArea.innerHTML = "";
        actionArea.appendChild(createBtn("Convert to PDF", "#4f46e5", convertToPDF));
    }

    function showDownloadButtons() {
        actionArea.innerHTML = "";

        const downloadBtn = createBtn("Download PDF", "#10b981", function () {
            let baseName = selectedImages[0].name.replace(/\.[^/.]+$/, "");
            generatedPDF.save(baseName + "_converted.pdf");
        });

        const resetBtn = createBtn("Reset", "#6b7280", function () {

            selectedImages = [];
            generatedPDF = null;
            pdfURL = null;

            fileInput.value = "";

            uploadBox.innerHTML = `
                <div class="upload-icon">
                    <img src="up.svg" alt="">
                </div>
                <p class="primary-text">
                    Drop images here or click to browse
                </p>
                <p class="secondary-text">
                    JPG, PNG
                </p>
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

    /* ================= HELPERS ================= */

    function toBase64(file) {
        return new Promise(resolve => {
            const reader = new FileReader();
            reader.onload = e => resolve(e.target.result);
            reader.readAsDataURL(file);
        });
    }

    function loadImage(src) {
        return new Promise(resolve => {
            const img = new Image();
            img.onload = () => resolve(img);
            img.src = src;
        });
    }

});