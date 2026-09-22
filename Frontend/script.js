// =========================================================
// PRAGYANAI PDF MERGER
// FRONTEND JAVASCRIPT
// =========================================================


// =========================================================
// RENDER BACKEND URL
// =========================================================
//
// CHANGE THIS TO YOUR ACTUAL RENDER URL.
//
// Example:
//
// const API_URL =
//     "https://pragyanai-pdf-merger.onrender.com";
//
// =========================================================

const API_URL =
    "https://YOUR-RENDER-APP.onrender.com";


// =========================================================
// APPLICATION STATE
// =========================================================

// Current mode

let currentMode = "pdf";


// Files are stored in this array.
//
// VERY IMPORTANT:
// The order of this array is the
// actual merge order.

let files = [];


// =========================================================
// HTML ELEMENTS
// =========================================================

const pdfModeBtn =
    document.getElementById("pdfModeBtn");

const imageModeBtn =
    document.getElementById("imageModeBtn");

const clearWorkspaceBtn =
    document.getElementById("clearWorkspaceBtn");


const pageTitle =
    document.getElementById("pageTitle");

const pageSubtitle =
    document.getElementById("pageSubtitle");


const uploadTitle =
    document.getElementById("uploadTitle");

const uploadText =
    document.getElementById("uploadText");


const dropZone =
    document.getElementById("dropZone");

const fileInput =
    document.getElementById("fileInput");

const browseBtn =
    document.getElementById("browseBtn");


const statusMessage =
    document.getElementById("statusMessage");


const filesTitle =
    document.getElementById("filesTitle");

const fileCount =
    document.getElementById("fileCount");


const fileList =
    document.getElementById("fileList");


const removeAllBtn =
    document.getElementById("removeAllBtn");


const mergeBtn =
    document.getElementById("mergeBtn");

const mergeBtnText =
    document.getElementById("mergeBtnText");


// =========================================================
// START APPLICATION
// =========================================================

updateUI();


// =========================================================
// PDF MODE
// =========================================================

pdfModeBtn.addEventListener(
    "click",
    function () {

        currentMode = "pdf";

        files = [];

        fileInput.value = "";

        pdfModeBtn.classList.add("active");

        imageModeBtn.classList.remove("active");

        updateUI();

        showStatus(
            "PDF merger selected.",
            "success"
        );

    }
);


// =========================================================
// IMAGE MODE
// =========================================================

imageModeBtn.addEventListener(
    "click",
    function () {

        currentMode = "image";

        files = [];

        fileInput.value = "";

        imageModeBtn.classList.add("active");

        pdfModeBtn.classList.remove("active");

        updateUI();

        showStatus(
            "Image merger selected.",
            "success"
        );

    }
);


// =========================================================
// CLEAR WORKSPACE
// =========================================================

clearWorkspaceBtn.addEventListener(
    "click",
    function () {

        files = [];

        fileInput.value = "";

        renderFiles();

        updateMergeButton();

        showStatus(
            "Workspace cleared.",
            "success"
        );

    }
);


// =========================================================
// BROWSE BUTTON
// =========================================================

browseBtn.addEventListener(
    "click",
    function (event) {

        event.stopPropagation();

        fileInput.click();

    }
);


// =========================================================
// CLICK DROP ZONE
// =========================================================

dropZone.addEventListener(
    "click",
    function (event) {

        if (
            event.target === browseBtn
        ) {

            return;

        }

        fileInput.click();

    }
);


// =========================================================
// SELECT FILES
// =========================================================

fileInput.addEventListener(
    "change",
    function (event) {

        const selectedFiles =
            Array.from(
                event.target.files
            );

        addFiles(selectedFiles);

        // Clear input
        //
        // This allows selecting the
        // same file again later.

        fileInput.value = "";

    }
);


// =========================================================
// DRAG OVER
// =========================================================

dropZone.addEventListener(
    "dragover",
    function (event) {

        event.preventDefault();

        dropZone.classList.add(
            "dragging"
        );

    }
);


// =========================================================
// DRAG LEAVE
// =========================================================

dropZone.addEventListener(
    "dragleave",
    function () {

        dropZone.classList.remove(
            "dragging"
        );

    }
);


// =========================================================
// DROP FILES
// =========================================================

dropZone.addEventListener(
    "drop",
    function (event) {

        event.preventDefault();

        dropZone.classList.remove(
            "dragging"
        );


        const droppedFiles =
            Array.from(
                event.dataTransfer.files
            );


        addFiles(droppedFiles);

    }
);


// =========================================================
// ADD FILES
// =========================================================

function addFiles(selectedFiles) {


    if (
        selectedFiles.length === 0
    ) {

        return;

    }


    const validFiles = [];


    for (
        const file of selectedFiles
    ) {


        // Check extension

        if (
            !isValidFile(file)
        ) {

            showStatus(
                `${file.name} is not a valid file.`,
                "error"
            );

            continue;

        }


        // Check duplicate

        const duplicate =
            files.some(
                existingFile =>

                    existingFile.name ===
                    file.name &&

                    existingFile.size ===
                    file.size
            );


        if (duplicate) {

            showStatus(
                `${file.name} is already added.`,
                "error"
            );

            continue;

        }


        validFiles.push(file);

    }


    // Maximum 20 files

    if (
        files.length +
        validFiles.length >
        20
    ) {

        showStatus(
            "Maximum 20 files allowed.",
            "error"
        );

        return;

    }


    // Add to array

    files.push(
        ...validFiles
    );


    // Update UI

    renderFiles();

    updateMergeButton();


    // Success

    if (
        validFiles.length > 0
    ) {

        if (
            currentMode === "pdf"
        ) {

            showStatus(
                "✓ PDF uploaded successfully",
                "success"
            );

        }

        else {

            showStatus(
                "✓ Image uploaded successfully",
                "success"
            );

        }

    }

}


// =========================================================
// VALIDATE FILE
// =========================================================

function isValidFile(file) {

    const filename =
        file.name.toLowerCase();


    if (
        currentMode === "pdf"
    ) {

        return filename.endsWith(
            ".pdf"
        );

    }


    return (

        filename.endsWith(".jpg") ||

        filename.endsWith(".jpeg") ||

        filename.endsWith(".png")

    );

}


// =========================================================
// DISPLAY FILES
// =========================================================

function renderFiles() {


    fileList.innerHTML = "";


    // No files

    if (
        files.length === 0
    ) {

        fileList.innerHTML = `

            <div class="empty-state">

                <div>
                    📁
                </div>

                <p>
                    No files added yet
                </p>

            </div>

        `;

        updateFileCount();

        return;

    }


    // Create each file row

    files.forEach(
        function (file, index) {


            const fileItem =
                document.createElement(
                    "div"
                );


            fileItem.className =
                "file-item";


            const icon =
                currentMode === "pdf"
                    ? "📄"
                    : "🖼️";


            fileItem.innerHTML = `

                <div class="file-number">
                    ${index + 1}
                </div>


                <div class="file-icon">
                    ${icon}
                </div>


                <div class="file-details">

                    <strong>
                        ${escapeHTML(
                            file.name
                        )}
                    </strong>

                    <span>
                        ${formatFileSize(
                            file.size
                        )}
                    </span>

                </div>


                <div class="file-actions">


                    <!-- MOVE UP -->

                    <button
                        class="move-btn"
                        data-action="up"
                        data-index="${index}"
                        ${index === 0
                            ? "disabled"
                            : ""}
                    >

                        ↑

                    </button>


                    <!-- MOVE DOWN -->

                    <button
                        class="move-btn"
                        data-action="down"
                        data-index="${index}"
                        ${index ===
                            files.length - 1
                            ? "disabled"
                            : ""}
                    >

                        ↓

                    </button>


                    <!-- REMOVE -->

                    <button
                        class="remove-btn"
                        data-action="remove"
                        data-index="${index}"
                    >

                        ✕

                    </button>


                </div>

            `;


            fileList.appendChild(
                fileItem
            );

        }
    );


    updateFileCount();

}


// =========================================================
// FILE BUTTON EVENTS
// =========================================================
//
// Event delegation is used because
// file buttons are dynamically created.
//
// This makes Move Up, Move Down
// and Remove work correctly.
//

fileList.addEventListener(
    "click",
    function (event) {


        const button =
            event.target.closest(
                "button"
            );


        if (!button) {

            return;

        }


        const action =
            button.dataset.action;


        const index =
            Number(
                button.dataset.index
            );


        // MOVE UP

        if (
            action === "up"
        ) {

            moveFileUp(index);

        }


        // MOVE DOWN

        else if (
            action === "down"
        ) {

            moveFileDown(index);

        }


        // REMOVE

        else if (
            action === "remove"
        ) {

            removeFile(index);

        }

    }
);


// =========================================================
// MOVE FILE UP
// =========================================================

function moveFileUp(index) {


    if (
        index <= 0
    ) {

        return;

    }


    // Swap current file
    // with previous file

    const temp =
        files[index - 1];


    files[index - 1] =
        files[index];


    files[index] =
        temp;


    // Redraw

    renderFiles();

    updateMergeButton();


    showStatus(
        "File moved up.",
        "success"
    );

}


// =========================================================
// MOVE FILE DOWN
// =========================================================

function moveFileDown(index) {


    if (
        index >= files.length - 1
    ) {

        return;

    }


    // Swap current file
    // with next file

    const temp =
        files[index + 1];


    files[index + 1] =
        files[index];


    files[index] =
        temp;


    // Redraw

    renderFiles();

    updateMergeButton();


    showStatus(
        "File moved down.",
        "success"
    );

}


// =========================================================
// REMOVE FILE
// =========================================================

function removeFile(index) {


    if (
        index < 0 ||
        index >= files.length
    ) {

        return;

    }


    const removed =
        files[index];


    files.splice(
        index,
        1
    );


    renderFiles();

    updateMergeButton();


    showStatus(
        `${removed.name} removed.`,
        "success"
    );

}


// =========================================================
// REMOVE ALL
// =========================================================

removeAllBtn.addEventListener(
    "click",
    function () {


        if (
            files.length === 0
        ) {

            showStatus(
                "No files to remove.",
                "error"
            );

            return;

        }


        files = [];

        fileInput.value = "";


        renderFiles();

        updateMergeButton();


        showStatus(
            "All files removed.",
            "success"
        );

    }
);


// =========================================================
// MERGE BUTTON
// =========================================================

mergeBtn.addEventListener(
    "click",
    function () {


        if (
            files.length < 2
        ) {

            showStatus(
                "Please upload at least 2 files.",
                "error"
            );

            return;

        }


        if (
            currentMode === "pdf"
        ) {

            mergePDF();

        }

        else {

            mergeImages();

        }

    }
);


// =========================================================
// MERGE PDF
// =========================================================

async function mergePDF() {


    setLoading(true);


    try {


        const formData =
            new FormData();


        // IMPORTANT:
        //
        // Add files in EXACT
        // current array order.
        //
        // Example:
        //
        // files =
        // [
        //   C.pdf,
        //   A.pdf,
        //   B.pdf
        // ]
        //
        // Backend receives:
        //
        // C.pdf
        // A.pdf
        // B.pdf

        files.forEach(
            function (file) {

                formData.append(
                    "files",
                    file,
                    file.name
                );

            }
        );


        // Send to Render

        const response =
            await fetch(
                `${API_URL}/merge/pdf`,
                {
                    method: "POST",
                    body: formData
                }
            );


        // Check response

        if (
            !response.ok
        ) {


            let message =
                "PDF merge failed.";


            try {

                const data =
                    await response.json();


                message =
                    data.detail ||
                    message;

            }

            catch (error) {

                // Ignore JSON error

            }


            throw new Error(
                message
            );

        }


        // Convert response
        // into PDF Blob

        const blob =
            await response.blob();


        // Download

        downloadFile(
            blob,
            "merged_pdfs.pdf"
        );


        showStatus(
            "✓ PDF merged successfully! Download started.",
            "success"
        );

    }


    catch (error) {


        console.error(
            "PDF merge error:",
            error
        );


        showStatus(
            `❌ ${error.message}`,
            "error"
        );

    }


    finally {

        setLoading(false);

    }

}


// =========================================================
// MERGE IMAGES
// =========================================================

async function mergeImages() {


    setLoading(true);


    try {


        const formData =
            new FormData();


        // Maintain current order

        files.forEach(
            function (file) {

                formData.append(
                    "files",
                    file,
                    file.name
                );

            }
        );


        const response =
            await fetch(
                `${API_URL}/merge/images`,
                {
                    method: "POST",
                    body: formData
                }
            );


        if (
            !response.ok
        ) {


            let message =
                "Image merge failed.";


            try {

                const data =
                    await response.json();


                message =
                    data.detail ||
                    message;

            }

            catch (error) {

                // Ignore

            }


            throw new Error(
                message
            );

        }


        const blob =
            await response.blob();


        downloadFile(
            blob,
            "merged_images.pdf"
        );


        showStatus(
            "✓ Images merged successfully! Download started.",
            "success"
        );

    }


    catch (error) {


        console.error(
            "Image merge error:",
            error
        );


        showStatus(
            `❌ ${error.message}`,
            "error"
        );

    }


    finally {

        setLoading(false);

    }

}


// =========================================================
// DOWNLOAD FILE
// =========================================================

function downloadFile(
    blob,
    filename
) {


    const url =
        window.URL.createObjectURL(
            blob
        );


    const link =
        document.createElement(
            "a"
        );


    link.href = url;

    link.download = filename;


    document.body.appendChild(
        link
    );


    link.click();


    link.remove();


    window.URL.revokeObjectURL(
        url
    );

}


// =========================================================
// UPDATE UI
// =========================================================

function updateUI() {


    if (
        currentMode === "pdf"
    ) {


        pageTitle.textContent =
            "Merge PDF Files";


        pageSubtitle.textContent =
            "Combine multiple PDF files into one PDF.";


        uploadTitle.textContent =
            "Drop PDF files here";


        uploadText.textContent =
            "or click to select PDF files";


        filesTitle.textContent =
            "PDF Files";


        fileInput.accept =
            ".pdf";


        mergeBtnText.textContent =
            "Merge & Download PDF";

    }


    else {


        pageTitle.textContent =
            "Merge Images";


        pageSubtitle.textContent =
            "Combine multiple images into one PDF.";


        uploadTitle.textContent =
            "Drop image files here";


        uploadText.textContent =
            "or click to select image files";


        filesTitle.textContent =
            "Image Files";


        fileInput.accept =
            ".jpg,.jpeg,.png";


        mergeBtnText.textContent =
            "Merge Images & Download";

    }


    renderFiles();

    updateMergeButton();

}


// =========================================================
// FILE COUNT
// =========================================================

function updateFileCount() {


    fileCount.textContent =
        `${files.length} file${
            files.length === 1
                ? ""
                : "s"
        }`;

}


// =========================================================
// MERGE BUTTON STATE
// =========================================================

function updateMergeButton() {


    mergeBtn.disabled =
        files.length < 2;

}


// =========================================================
// LOADING
// =========================================================

function setLoading(
    loading
) {


    if (loading) {


        mergeBtn.disabled =
            true;


        mergeBtnText.textContent =
            "Merging...";


    }


    else {


        updateMergeButton();


        if (
            currentMode === "pdf"
        ) {

            mergeBtnText.textContent =
                "Merge & Download PDF";

        }

        else {

            mergeBtnText.textContent =
                "Merge Images & Download";

        }

    }

}


// =========================================================
// STATUS
// =========================================================

function showStatus(
    message,
    type
) {


    statusMessage.textContent =
        message;


    statusMessage.className =
        `status-message ${type}`;


    setTimeout(
        function () {

            statusMessage.textContent =
                "";

            statusMessage.className =
                "status-message";

        },
        4000
    );

}


// =========================================================
// FILE SIZE
// =========================================================

function formatFileSize(
    bytes
) {


    if (
        bytes === 0
    ) {

        return "0 Bytes";

    }


    const units = [
        "Bytes",
        "KB",
        "MB",
        "GB"
    ];


    const index =
        Math.floor(
            Math.log(bytes) /
            Math.log(1024)
        );


    return (
        parseFloat(
            (
                bytes /
                Math.pow(
                    1024,
                    index
                )
            ).toFixed(2)
        )
        +
        " "
        +
        units[index]
    );

}


// =========================================================
// ESCAPE HTML
// =========================================================

function escapeHTML(
    value
) {


    return value

        .replaceAll(
            "&",
            "&amp;"
        )

        .replaceAll(
            "<",
            "&lt;"
        )

        .replaceAll(
            ">",
            "&gt;"
        )

        .replaceAll(
            '"',
            "&quot;"
        )

        .replaceAll(
            "'",
            "&#039;"
        );

}
