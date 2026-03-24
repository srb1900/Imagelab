document.addEventListener("DOMContentLoaded", function () {

    const uploadBox = document.getElementById("uploadBox");
    const fileInput = document.getElementById("fileInput");

    let selectedImage = null;
    let compressedBlob = null;
    let compressedURL = null;
    let originalSize = 0;

    const actionArea = document.createElement("div");
    actionArea.style.cssText = "margin-top:25px;text-align:center;width:100%;";
    uploadBox.parentNode.insertBefore(actionArea, uploadBox.nextSibling);

    /* ================= EVENTS ================= */

    uploadBox.addEventListener("click", () => {
        if (!compressedBlob) {
            fileInput.accept = "image/*";
            fileInput.multiple = false;
            fileInput.click();
        }
    });

    fileInput.addEventListener("change", function () {
        if (this.files.length > 0) {
            selectedImage = this.files[0];
            originalSize = selectedImage.size;

            showPreview(selectedImage);
            showCompressButton();
        }
    });

    /* ================= PREVIEW ================= */

    function showPreview(file) {
        const reader = new FileReader();
        reader.onload = function (e) {
            uploadBox.innerHTML = `
                <img src="${e.target.result}" 
                style="width:100%;height:100%;object-fit:contain;border-radius:inherit;">
            `;
        };
        reader.readAsDataURL(file);
    }

    /* ================= COMPRESSION ================= */

    function compressImage() {

        actionArea.innerHTML = "<p>Compressing...</p>";

        const reader = new FileReader();

        reader.onload = function (e) {

            const img = new Image();

            img.onload = function () {

                const canvas = document.createElement("canvas");
                const ctx = canvas.getContext("2d");

                canvas.width = img.width;
                canvas.height = img.height;

                ctx.drawImage(img, 0, 0);

                const quality = 0.5; // adjust here

                canvas.toBlob(function (blob) {

                    compressedBlob = blob;

                    if (compressedURL) URL.revokeObjectURL(compressedURL);
                    compressedURL = URL.createObjectURL(blob);

                    uploadBox.innerHTML = `
                        <img src="${compressedURL}" 
                        style="width:100%;height:100%;object-fit:contain;border-radius:inherit;">
                    `;

                    showDownloadButtons();

                }, "image/jpeg", quality);

            };

            img.src = e.target.result;
        };

        reader.readAsDataURL(selectedImage);
    }

    /* ================= BUTTONS ================= */

    function showCompressButton() {
        actionArea.innerHTML = "";
        actionArea.appendChild(
            createBtn("Compress Image", "#4f46e5", compressImage)
        );
    }

    function showDownloadButtons() {
        actionArea.innerHTML = "";

        const compressedSize = compressedBlob.size;

        const reduction = (
            ((originalSize - compressedSize) / originalSize) * 100
        ).toFixed(1);

        const originalKB = (originalSize / 1024).toFixed(1);
        const compressedKB = (compressedSize / 1024).toFixed(1);

        const downloadBtn = createBtn(
            "Download Compressed Image",
            "#10b981",
            function () {

                let baseName = selectedImage.name.replace(/\.[^/.]+$/, "");

                const link = document.createElement("a");
                link.href = compressedURL;
                link.download = baseName + "_compressed.jpg";
                link.click();
            }
        );

        const info = document.createElement("div");
        info.style.marginTop = "8px";
        info.style.fontSize = "14px";
        info.innerHTML = `
            Original: ${originalKB} KB<br>
            Compressed: ${compressedKB} KB<br>
            Reduced by: <strong>${reduction}%</strong>
        `;

        const resetBtn = createBtn("Reset", "#6b7280", function () {

            selectedImage = null;
            compressedBlob = null;
            compressedURL = null;
            originalSize = 0;

            fileInput.value = "";

            uploadBox.innerHTML = `
                <div class="upload-icon">
                    <img src="up.svg" alt="">
                </div>
                <p class="primary-text">
                    Drop image here or click to browse
                </p>
                <p class="secondary-text">
                    JPG, PNG
                </p>
            `;

            actionArea.innerHTML = "";
        });

        actionArea.appendChild(downloadBtn);
        actionArea.appendChild(info);
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