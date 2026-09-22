/*
============================================================
    MergeFlow Frontend

    Features:
    - PDF Merger
    - Image Merger
    - Drag & Drop
    - File ordering
    - Move Up
    - Move Down
    - Remove individual files
    - Remove All
    - Success notifications
    - Error notifications
    - Download merged PDF
============================================================
*/


// ==========================================================
// BACKEND URL
// ==========================================================

// LOCAL DEVELOPMENT
//
// const API_URL =
//     "http://127.0.0.1:8000";


// AFTER RENDER DEPLOYMENT
// Replace this with your actual Render URL.

const API_URL =
    "https://melodious-cat-b1db76.netlify.app/;


// ==========================================================
// DOM ELEMENTS
// ==========================================================

const fileInput =
    document.getElementById(
        "fileInput"
    );

const uploadArea =
    document.querySelector(
        ".upload-area"
    );

const fileList =
    document.getElementById(
        "fileList"
    );

const emptyState =
    document.getElementById(
        "emptyState"
    );

const fileCount =
    document.getElementById(
        "fileCount"
    );

const moveUpButton =
    document.getElementById(
        "moveUp"
    );

const moveDownButton =
    document.getElementById(
        "moveDown"
    );

const removeAllButton =
    document.getElementById(
        "removeAll"
    );

const mergeButton =
    document.getElementById(
        "mergeButton"
    );

const mergeButtonText =
    document.getElementById(
        "mergeButtonText"
    );

const clearWorkspace =
    document.getElementById(
        "clearWorkspace"
    );

const pdfModeButton =
    document.getElementById(
        "pdfModeButton"
    );

const imageModeButton =
    document.getElementById(
        "imageModeButton"
    );

const heroTitle =
    document.getElementById(
        "heroTitle"
    );

const heroDescription =
    document.getElementById(
        "heroDescription"
    );

const eyebrow =
    document.getElementById(
        "eyebrow"
    );

const uploadTitle =
    document.getElementById(
        "uploadTitle"
    );

const uploadFormats =
    document.getElementById(
        "uploadFormats"
    );

const fileHeading =
    document.getElementById(
        "fileHeading"
    );

const emptyTitle =
    document.getElementById(
        "emptyTitle"
    );

const emptyDescription =
    document.getElementById(
        "emptyDescription"
    );

const message =
    document.getElementById(
        "message"
    );


// ==========================================================
// APPLICATION STATE
// ==========================================================

// Current mode:
// "pdf"    -> PDF merger
// "image"  -> Image merger

let currentMode = "pdf";


// Files currently selected by user

let files = [];


// Currently selected file

let selectedIndex = null;


// ==========================================================
// ALLOWED FILE TYPES
// ==========================================================

const pdfExtensions = [
    "pdf"
];

const imageExtensions = [
    "jpg",
    "jpeg",
    "png"
];


// ==========================================================
// FILE INPUT
// ==========================================================

fileInput.addEventListener(
    "change",
    function (event) {

        const selectedFiles =
            Array.from(
                event.target.files
            );

        addFiles(
            selectedFiles
        );


        // Allows the user to
        // select the same file again.

        event.target.value = "";

    }
);


// ==========================================================
// DRAG OVER
// ==========================================================

uploadArea.addEventListener(
    "dragover",
    function (event) {

        event.preventDefault();

        uploadArea.classList.add(
            "dragover"
        );

    }
);


// ==========================================================
// DRAG LEAVE
// ==========================================================

uploadArea.addEventListener(
    "dragleave",
    function () {

        uploadArea.classList.remove(
            "dragover"
        );

    }
);


// ==========================================================
// DROP FILES
// ==========================================================

uploadArea.addEventListener(
    "drop",
    function (event) {

        event.preventDefault();

        uploadArea.classList.remove(
            "dragover"
        );


        const droppedFiles =
            Array.from(
                event.dataTransfer.files
            );


        addFiles(
            droppedFiles
        );

    }
);


// ==========================================================
// ADD FILES
// ==========================================================

function addFiles(newFiles) {

    let addedCount = 0;

    let rejectedCount = 0;


    newFiles.forEach(
        function (file) {

            const extension =
                file.name
                    .split(".")
                    .pop()
                    .toLowerCase();


            // ------------------------------------------------
            // Check file based on current mode
            // ------------------------------------------------

            let isValid = false;


            if (
                currentMode === "pdf"
            ) {

                isValid =
                    pdfExtensions.includes(
                        extension
                    );

            }


            else {

                isValid =
                    imageExtensions.includes(
                        extension
                    );

            }


            // ------------------------------------------------
            // Reject invalid file
            // ------------------------------------------------

            if (!isValid) {

                rejectedCount++;

                return;

            }


            // ------------------------------------------------
            // Add valid file
            // ------------------------------------------------

            files.push(
                file
            );

            addedCount++;

        }
    );


    selectedIndex = null;


    renderFiles();


    // --------------------------------------------------------
    // Success message
    // --------------------------------------------------------

    if (addedCount > 0) {

        const fileType =
            currentMode === "pdf"
                ? "PDF"
                : "Image";


        const plural =
            addedCount === 1
                ? ""
                : "s";


        showMessage(

            `✓ ${fileType}${plural} uploaded successfully`,

            "success"

        );

    }


    // --------------------------------------------------------
    // Rejected message
    // --------------------------------------------------------

    if (rejectedCount > 0) {

        const allowed =
            currentMode === "pdf"
                ? "PDF"
                : "JPG, JPEG and PNG";


        showMessage(

            `Only ${allowed} files are allowed in this mode.`,

            "error"

        );

    }

}


// ==========================================================
// RENDER FILE LIST
// ==========================================================

function renderFiles() {

    fileList.innerHTML = "";


    // --------------------------------------------------------
    // Empty state
    // --------------------------------------------------------

    if (
        files.length === 0
    ) {

        fileList.appendChild(
            emptyState
        );

        emptyState.style.display =
            "block";

    }


    // --------------------------------------------------------
    // File list
    // --------------------------------------------------------

    else {

        emptyState.style.display =
            "none";


        files.forEach(
            function (file, index) {

                // Create row

                const row =
                    document.createElement(
                        "div"
                    );


                row.className =
                    "file-row";


                // Highlight selected file

                if (
                    selectedIndex === index
                ) {

                    row.classList.add(
                        "selected"
                    );

                }


                // Select file

                row.addEventListener(
                    "click",
                    function () {

                        selectFile(
                            index
                        );

                    }
                );


                // ------------------------------------------------
                // NUMBER
                // ------------------------------------------------

                const number =
                    document.createElement(
                        "div"
                    );


                number.className =
                    "file-number";


                number.textContent =
                    index + 1;


                // ------------------------------------------------
                // ICON
                // ------------------------------------------------

                const icon =
                    document.createElement(
                        "div"
                    );


                icon.className =
                    "file-icon";


                icon.textContent =
                    getFileIcon(
                        file
                    );


                // ------------------------------------------------
                // FILE INFORMATION
                // ------------------------------------------------

                const info =
                    document.createElement(
                        "div"
                    );


                info.className =
                    "file-info";


                const name =
                    document.createElement(
                        "div"
                    );


                name.className =
                    "file-name";


                name.textContent =
                    file.name;


                const size =
                    document.createElement(
                        "div"
                    );


                size.className =
                    "file-size";


                size.textContent =
                    formatFileSize(
                        file.size
                    );


                info.appendChild(
                    name
                );


                info.appendChild(
                    size
                );


                // ------------------------------------------------
                // REMOVE BUTTON
                // ------------------------------------------------

                const removeButton =
                    document.createElement(
                        "button"
                    );


                removeButton.className =
                    "remove-file";


                removeButton.textContent =
                    "×";


                removeButton.title =
                    "Remove file";


                removeButton.addEventListener(
                    "click",
                    function (event) {

                        event.stopPropagation();

                        removeFile(
                            index
                        );

                    }
                );


                // ------------------------------------------------
                // ADD ELEMENTS
                // ------------------------------------------------

                row.appendChild(
                    number
                );


                row.appendChild(
                    icon
                );


                row.appendChild(
                    info
                );


                row.appendChild(
                    removeButton
                );


                fileList.appendChild(
                    row
                );

            }
        );

    }


    updateControls();

}


// ==========================================================
// SELECT FILE
// ==========================================================

function selectFile(index) {

    selectedIndex =
        index;


    renderFiles();

}


// ==========================================================
// REMOVE ONE FILE
// ==========================================================

function removeFile(index) {

    const removedFile =
        files[index];


    files.splice(
        index,
        1
    );


    // Adjust selected index

    if (
        selectedIndex === index
    ) {

        selectedIndex =
            null;

    }

    else if (
        selectedIndex !== null &&
        selectedIndex > index
    ) {

        selectedIndex--;

    }


    renderFiles();


    showMessage(

        `✓ ${removedFile.name} removed`,

        "success"

    );

}


// ==========================================================
// REMOVE ALL FILES
// ==========================================================

function removeAllFiles() {

    if (
        files.length === 0
    ) {

        return;

    }


    files = [];

    selectedIndex = null;


    renderFiles();


    showMessage(

        "✓ All files removed",

        "success"

    );

}


removeAllButton.addEventListener(
    "click",
    removeAllFiles
);


clearWorkspace.addEventListener(
    "click",
    removeAllFiles
);


// ==========================================================
// MOVE UP
// ==========================================================

moveUpButton.addEventListener(
    "click",
    function () {

        if (
            selectedIndex === null ||
            selectedIndex <= 0
        ) {

            return;

        }


        const currentFile =
            files[selectedIndex];


        files[selectedIndex] =
            files[selectedIndex - 1];


        files[selectedIndex - 1] =
            currentFile;


        selectedIndex--;


        renderFiles();

    }
);


// ==========================================================
// MOVE DOWN
// ==========================================================

moveDownButton.addEventListener(
    "click",
    function () {

        if (
            selectedIndex === null ||
            selectedIndex >= files.length - 1
        ) {

            return;

        }


        const currentFile =
            files[selectedIndex];


        files[selectedIndex] =
            files[selectedIndex + 1];


        files[selectedIndex + 1] =
            currentFile;


        selectedIndex++;


        renderFiles();

    }
);


// ==========================================================
// PDF MODE
// ==========================================================

pdfModeButton.addEventListener(
    "click",
    function () {

        switchMode(
            "pdf"
        );

    }
);


// ==========================================================
// IMAGE MODE
// ==========================================================

imageModeButton.addEventListener(
    "click",
    function () {

        switchMode(
            "image"
        );

    }
);


// ==========================================================
// SWITCH MODE
// ==========================================================

function switchMode(mode) {

    currentMode =
        mode;


    // Clear existing files
    // because PDF and Image
    // modes accept different formats.

    files = [];

    selectedIndex = null;


    // --------------------------------------------------------
    // PDF MODE
    // --------------------------------------------------------

    if (
        mode === "pdf"
    ) {

        pdfModeButton.classList.add(
            "active"
        );


        imageModeButton.classList.remove(
            "active"
        );


        eyebrow.textContent =
            "PDF WORKFLOW";


        heroTitle.innerHTML =
            `
            Merge files.
            <br>
            <span>
                One clean PDF.
            </span>
            `;


        heroDescription.textContent =
            "Combine your PDF files, arrange them exactly how you want, and download one polished document.";


        uploadTitle.textContent =
            "Drop PDF files here";


        uploadFormats.textContent =
            "PDF files only";


        fileHeading.textContent =
            "Your PDF files";


        emptyTitle.textContent =
            "No PDF files yet";


        emptyDescription.textContent =
            "Upload PDF files to start building your document.";


        mergeButtonText.textContent =
            "Merge & Download PDF";


        fileInput.accept =
            ".pdf";

    }


    // --------------------------------------------------------
    // IMAGE MODE
    // --------------------------------------------------------

    else {

        imageModeButton.classList.add(
            "active"
        );


        pdfModeButton.classList.remove(
            "active"
        );


        eyebrow.textContent =
            "IMAGE WORKFLOW";


        heroTitle.innerHTML =
            `
            Merge images.
            <br>
            <span>
                One beautiful PDF.
            </span>
            `;


        heroDescription.textContent =
            "Combine your images, arrange them exactly how you want, and download them as one polished PDF.";


        uploadTitle.textContent =
            "Drop images here";


        uploadFormats.textContent =
            "JPG, JPEG and PNG";


        fileHeading.textContent =
            "Your images";


        emptyTitle.textContent =
            "No images yet";


        emptyDescription.textContent =
            "Upload images to start building your document.";


        mergeButtonText.textContent =
            "Merge Images & Download";


        fileInput.accept =
            ".jpg,.jpeg,.png";

    }


    renderFiles();

}


// ==========================================================
// MERGE BUTTON
// ==========================================================

mergeButton.addEventListener(
    "click",
    mergeFiles
);


// ==========================================================
// MERGE FILES
// ==========================================================

async function mergeFiles() {

    // --------------------------------------------------------
    // Check files
    // --------------------------------------------------------

    if (
        files.length === 0
    ) {

        showMessage(

            currentMode === "pdf"
                ? "Please upload at least one PDF."
                : "Please upload at least one image.",

            "error"

        );

        return;

    }


    // --------------------------------------------------------
    // Loading state
    // --------------------------------------------------------

    setLoading(
        true
    );


    try {

        // Create FormData

        const formData =
            new FormData();


        // Add files in displayed order

        files.forEach(
            function (file) {

                formData.append(
                    "files",
                    file
                );

            }
        );


        // ----------------------------------------------------
        // Select correct API
        // ----------------------------------------------------

        const endpoint =
            currentMode === "pdf"
                ? "/merge/pdf"
                : "/merge/images";


        // ----------------------------------------------------
        // Send request to Render
        // ----------------------------------------------------

        const response =
            await fetch(

                `${API_URL}${endpoint}`,

                {
                    method: "POST",

                    body: formData
                }

            );


        // ----------------------------------------------------
        // Handle error
        // ----------------------------------------------------

        if (
            !response.ok
        ) {

            let errorMessage =
                "Unable to merge files.";


            try {

                const data =
                    await response.json();


                errorMessage =
                    data.detail ||
                    errorMessage;

            }

            catch (error) {

                // Ignore JSON parsing error

            }


            throw new Error(
                errorMessage
            );

        }


        // ----------------------------------------------------
        // Convert response to Blob
        // ----------------------------------------------------

        const blob =
            await response.blob();


        // ----------------------------------------------------
        // Create download URL
        // ----------------------------------------------------

        const downloadURL =
            window.URL.createObjectURL(
                blob
            );


        // ----------------------------------------------------
        // Create download link
        // ----------------------------------------------------

        const link =
            document.createElement(
                "a"
            );


        link.href =
            downloadURL;


        link.download =
            currentMode === "pdf"
                ? "merged_pdfs.pdf"
                : "merged_images.pdf";


        document.body.appendChild(
            link
        );


        // Start download

        link.click();


        // Remove link

        link.remove();


        // Release memory

        window.URL.revokeObjectURL(
            downloadURL
        );


        // ----------------------------------------------------
        // SUCCESS MESSAGE
        // ----------------------------------------------------

        if (
            currentMode === "pdf"
        ) {

            showMessage(

                "✓ PDF merged successfully! Download started.",

                "success"

            );

        }

        else {

            showMessage(

                "✓ Images merged successfully! Download started.",

                "success"

            );

        }

    }


    catch (error) {

        console.error(
            "Merge error:",
            error
        );


        showMessage(

            `✕ ${error.message}`,

            "error"

        );

    }


    finally {

        setLoading(
            false
        );

    }

}


// ==========================================================
// LOADING STATE
// ==========================================================

function setLoading(
    loading
) {

    mergeButton.disabled =
        loading ||
        files.length === 0;


    if (
        loading
    ) {

        mergeButton.innerHTML =
            `
            <span class="loading-spinner">
                ⟳
            </span>

            <span>
                ${
                    currentMode === "pdf"
                    ? "Merging PDFs..."
                    : "Merging Images..."
                }
            </span>
            `;

    }

    else {

        mergeButton.innerHTML =
            `
            <span>
                ✦
            </span>

            <span id="mergeButtonText">
                ${
                    currentMode === "pdf"
                    ? "Merge & Download PDF"
                    : "Merge Images & Download"
                }
            </span>
            `;

    }

}


// ==========================================================
// UPDATE BUTTONS
// ==========================================================

function updateControls() {

    fileCount.textContent =
        files.length;


    removeAllButton.disabled =
        files.length === 0;


    mergeButton.disabled =
        files.length === 0;


    moveUpButton.disabled =
        selectedIndex === null ||
        selectedIndex === 0;


    moveDownButton.disabled =
        selectedIndex === null ||
        selectedIndex === files.length - 1;

}


// ==========================================================
// FILE ICON
// ==========================================================

function getFileIcon(file) {

    const extension =
        file.name
            .split(".")
            .pop()
            .toLowerCase();


    if (
        extension === "pdf"
    ) {

        return "📄";

    }


    return "🖼️";

}


// ==========================================================
// FILE SIZE
// ==========================================================

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


// ==========================================================
// SHOW MESSAGE
// ==========================================================

function showMessage(
    text,
    type
) {

    message.textContent =
        text;


    message.className =
        `message ${type}`;


    // Automatically hide
    // the notification after 5 seconds.

    setTimeout(
        function () {

            message.className =
                "message";

        },
        5000
    );

}


// ==========================================================
// INITIALIZE APPLICATION
// ==========================================================

switchMode(
    "pdf"
);
