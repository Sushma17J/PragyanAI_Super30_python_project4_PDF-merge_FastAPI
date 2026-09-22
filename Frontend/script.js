// =========================================================
// PRAGYANAI PDF & IMAGE MERGER
// FRONTEND JAVASCRIPT
// =========================================================


// =========================================================
// 1. BACKEND URL
// =========================================================
//
// FOR LOCAL TESTING:
// const API_URL = "http://127.0.0.1:8000";
//
// AFTER DEPLOYING BACKEND TO RENDER:
// const API_URL = "https://your-app-name.onrender.com";
//
// IMPORTANT:
// Do NOT add /merge/pdf here.
// =========================================================

const API_URL = "https://pragyanai-super30-python-project4-pdf.onrender.com";

// After Render deployment, change it to:
//
// const API_URL = "https://your-render-app.onrender.com";


// =========================================================
// 2. APPLICATION STATE
// =========================================================

// Current application mode
// "pdf"   = PDF merger
// "image" = Image merger

let currentMode = "pdf";

// Stores uploaded files.
//
// IMPORTANT:
// The order of this array is the actual
// order in which files will be merged.

let files = [];


// =========================================================
// 3. GET HTML ELEMENTS
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
// 4. START APPLICATION
// =========================================================

updateUI();


// =========================================================
// 5. PDF MODE BUTTON
// =========================================================

pdfModeBtn.addEventListener(
    "click",
    function () {

        // Change mode
        currentMode = "pdf";

        // Clear previous files
        files = [];

        // Clear file input
        fileInput.value = "";

        // Change active button
        pdfModeBtn.classList.add("active");

        imageModeBtn.classList.remove("active");

        // Update page
        updateUI();

        showStatus(
            "PDF merger selected.",
            "success"
        );

    }
);


// =========================================================
// 6. IMAGE MODE BUTTON
// =========================================================

imageModeBtn.addEventListener(
    "click",
    function () {

        // Change mode
        currentMode = "image";

        // Clear previous files
        files = [];

        // Clear file input
        fileInput.value = "";

        // Change active button
        imageModeBtn.classList.add("active");

        pdfModeBtn.classList.remove("active");

        // Update page
        updateUI();

        showStatus(
            "Image merger selected.",
            "success"
        );

    }
);


// =========================================================
// 7. CLEAR WORKSPACE
// =========================================================

clearWorkspaceBtn.addEventListener(
    "click",
    function () {

        // Remove all files
        files = [];

        // Clear file input
        fileInput.value = "";

        // Update display
        renderFiles();

        updateMergeButton();

        showStatus(
            "Workspace cleared.",
            "success"
        );

    }
);


// =========================================================
// 8. BROWSE FILES BUTTON
// =========================================================

browseBtn.addEventListener(
    "click",
    function (event) {

        // Prevent the drop-zone click
        // from firing twice.

        event.stopPropagation();

        fileInput.click();

    }
);


// =========================================================
// 9. CLICK DROP ZONE
// =========================================================

dropZone.addEventListener(
    "click",
    function (event) {

        // If Browse button was clicked,
        // don't trigger file picker twice.

        if (
            event.target === browseBtn
        ) {
            return;
        }

        fileInput.click();

    }
);


// =========================================================
// 10. FILE INPUT CHANGE
// =========================================================

fileInput.addEventListener(
    "change",
    function (event) {

        // Convert FileList to normal array
        const selectedFiles =
            Array.from(
                event.target.files
            );

        // Add files
        addFiles(selectedFiles);

        // Clear input.
        //
        // This allows the user to select
        // the same file again later.

        fileInput.value = "";

    }
);


// =========================================================
// 11. DRAG OVER
// =========================================================

dropZone.addEventListener(
    "dragover",
    function (event) {

        // Required for drop to work
        event.preventDefault();

        dropZone.classList.add(
            "dragging"
        );

    }
);


// =========================================================
// 12. DRAG LEAVE
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
// 13. DROP FILES
// =========================================================

dropZone.addEventListener(
    "drop",
    function (event) {

        // Prevent browser from opening files
        event.preventDefault();

        dropZone.classList.remove(
            "dragging"
        );

        // Get dropped files
        const droppedFiles =
            Array.from(
                event.dataTransfer.files
            );

        // Add files
        addFiles(droppedFiles);

    }
);


// =========================================================
// 14. ADD FILES
// =========================================================

function addFiles(selectedFiles) {

    // Nothing selected
    if (
        selectedFiles.length === 0
    ) {
        return;
    }


    const validFiles = [];


    // Check every selected file

    for (
        const file of selectedFiles
    ) {

        // Check file type

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
                function (existingFile) {

                    return (
                        existingFile.name ===
                        file.name &&

                        existingFile.size ===
                        file.size
                    );

                }
            );


        if (duplicate) {

            showStatus(
                `${file.name} is already added.`,
                "error"
            );

            continue;
        }


        // File is valid

        validFiles.push(file);

    }


    // Check maximum 20 files

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


    // Add valid files to array

    files.push(
        ...validFiles
    );


    // Update UI

    renderFiles();

    updateMergeButton();


    // Show success message

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

        } else {

            showStatus(
                "✓ Image uploaded successfully",
                "success"
            );

        }

    }

}


// =========================================================
// 15. VALIDATE FILE TYPE
// =========================================================

function isValidFile(file) {

    const filename =
        file.name.toLowerCase();


    // PDF mode

    if (
        currentMode === "pdf"
    ) {

        return filename.endsWith(
            ".pdf"
        );

    }


    // Image mode

    return (
        filename.endsWith(".jpg") ||
        filename.endsWith(".jpeg") ||
        filename.endsWith(".png")
    );

}


// =========================================================
// 16. DISPLAY FILES
// =========================================================

function renderFiles() {

    // Clear current list

    fileList.innerHTML = "";


    // If no files

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


    // Create one row for each file

    files.forEach(
        function (file, index) {

            // Create file row

            const fileItem =
                document.createElement(
                    "div"
                );

            fileItem.className =
                "file-item";


            // Choose icon

            const icon =
                currentMode === "pdf"
                    ? "📄"
                    : "🖼️";


            // Create HTML

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
                        type="button"
                        class="move-btn"
                        data-action="up"
                        data-index="${index}"

                        ${
                            index === 0
                                ? "disabled"
                                : ""
                        }
                    >
                        ↑
                    </button>


                    <!-- MOVE DOWN -->

                    <button
                        type="button"
                        class="move-btn"
                        data-action="down"
                        data-index="${index}"

                        ${
                            index === files.length - 1
                                ? "disabled"
                                : ""
                        }
                    >
                        ↓
                    </button>


                    <!-- REMOVE -->

                    <button
                        type="button"
                        class="remove-btn"
                        data-action="remove"
                        data-index="${index}"
                    >
                        ✕
                    </button>


                </div>

            `;


            // Add row to list

            fileList.appendChild(
                fileItem
            );

        }
    );


    updateFileCount();

}


// =========================================================
// 17. FILE BUTTON HANDLER
// =========================================================
//
// This handles:
//     Move Up
//     Move Down
//     Remove
//
// The buttons are dynamically created,
// so event delegation is used.
// =========================================================

fileList.addEventListener(
    "click",
    function (event) {

        // Find clicked button

        const button =
            event.target.closest(
                "button"
            );


        // If click wasn't on button

        if (!button) {
            return;
        }


        // Get action

        const action =
            button.dataset.action;


        // Get file index

        const index =
            Number(
                button.dataset.index
            );


        // Move Up

        if (
            action === "up"
        ) {

            moveFileUp(index);

        }


        // Move Down

        else if (
            action === "down"
        ) {

            moveFileDown(index);

        }


        // Remove

        else if (
            action === "remove"
        ) {

            removeFile(index);

        }

    }
);


// =========================================================
// 18. MOVE FILE UP
// =========================================================

function moveFileUp(index) {

    // First file cannot move up

    if (
        index <= 0
    ) {
        return;
    }


    // Swap current file
    // with previous file

    const temporary =
        files[index - 1];


    files[index - 1] =
        files[index];


    files[index] =
        temporary;


    // Refresh display

    renderFiles();

    updateMergeButton();


    showStatus(
        "File moved up.",
        "success"
    );

}


// =========================================================
// 19. MOVE FILE DOWN
// =========================================================

function moveFileDown(index) {

    // Last file cannot move down

    if (
        index >= files.length - 1
    ) {
        return;
    }


    // Swap current file
    // with next file

    const temporary =
        files[index + 1];


    files[index + 1] =
        files[index];


    files[index] =
        temporary;


    // Refresh display

    renderFiles();

    updateMergeButton();


    showStatus(
        "File moved down.",
        "success"
    );

}


// =========================================================
// 20. REMOVE ONE FILE
// =========================================================

function removeFile(index) {

    // Check index

    if (
        index < 0 ||
        index >= files.length
    ) {
        return;
    }


    const removedFile =
        files[index];


    // Remove one file

    files.splice(
        index,
        1
    );


    // Refresh

    renderFiles();

    updateMergeButton();


    showStatus(
        `${removedFile.name} removed.`,
        "success"
    );

}


// =========================================================
// 21. REMOVE ALL
// =========================================================

removeAllBtn.addEventListener(
    "click",
    function () {

        // Remove all files

        files = [];

        // Clear input

        fileInput.value = "";

        // Refresh

        renderFiles();

        updateMergeButton();


        showStatus(
            "All files removed.",
            "success"
        );

    }
);


// =========================================================
// 22. MERGE BUTTON
// =========================================================

mergeBtn.addEventListener(
    "click",
    function () {

        // Need at least 2 files

        if (
            files.length < 2
        ) {

            showStatus(
                "Please upload at least 2 files.",
                "error"
            );

            return;
        }


        // PDF

        if (
            currentMode === "pdf"
        ) {

            mergePDF();

        }


        // Images

        else {

            mergeImages();

        }

    }
);


// =========================================================
// 23. MERGE PDF
// =========================================================

async function mergePDF() {

    setLoading(true);


    try {

        // Create form data

        const formData =
            new FormData();


        // IMPORTANT:
        //
        // Files are added in their CURRENT order.
        //
        // Example:
        //
        // files array:
        //
        // B.pdf
        // C.pdf
        // A.pdf
        //
        // Backend receives:
        //
        // B.pdf
        // C.pdf
        // A.pdf
        //
        // Therefore Move Up / Down
        // controls actual merge order.

        files.forEach(
            function (file) {

                formData.append(
                    "files",
                    file,
                    file.name
                );

            }
        );


        // Helpful debugging

        console.log(
            "Files being sent:",
            files.map(
                function (file) {
                    return file.name;
                }
            )
        );


        // Send request to backend

        const response =
            await fetch(
                `${API_URL}/merge/pdf`,
                {
                    method: "POST",
                    body: formData
                }
            );


        // Check HTTP response

        if (
            !response.ok
        ) {

            let errorMessage =
                "PDF merge failed.";


            try {

                const errorData =
                    await response.json();


                errorMessage =
                    errorData.detail ||
                    errorMessage;

            } catch (error) {

                console.error(
                    "Could not read server error:",
                    error
                );

            }


            throw new Error(
                errorMessage
            );

        }


        // Convert server response
        // into a PDF Blob

        const blob =
            await response.blob();


        // Download PDF

        downloadFile(
            blob,
            "merged_pdfs.pdf"
        );


        // Success

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


        // Display actual error
        // instead of hiding it.

        if (
            error.message ===
            "Failed to fetch"
        ) {

            showStatus(
                "❌ Failed to fetch. Check your Render URL, backend status, and CORS settings.",
                "error"
            );

        } else {

            showStatus(
                `❌ ${error.message}`,
                "error"
            );

        }

    }


    finally {

        setLoading(false);

    }

}


// =========================================================
// 24. MERGE IMAGES
// =========================================================

async function mergeImages() {

    setLoading(true);


    try {

        // Create form data

        const formData =
            new FormData();


        // Add images in current order

        files.forEach(
            function (file) {

                formData.append(
                    "files",
                    file,
                    file.name
                );

            }
        );


        // Send to backend

        const response =
            await fetch(
                `${API_URL}/merge/images`,
                {
                    method: "POST",
                    body: formData
                }
            );


        // Check response

        if (
            !response.ok
        ) {

            let errorMessage =
                "Image merge failed.";


            try {

                const errorData =
                    await response.json();


                errorMessage =
                    errorData.detail ||
                    errorMessage;

            } catch (error) {

                console.error(
                    "Could not read server error:",
                    error
                );

            }


            throw new Error(
                errorMessage
            );

        }


        // Get PDF

        const blob =
            await response.blob();


        // Download

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


        if (
            error.message ===
            "Failed to fetch"
        ) {

            showStatus(
                "❌ Failed to fetch. Check your Render URL, backend status, and CORS settings.",
                "error"
            );

        } else {

            showStatus(
                `❌ ${error.message}`,
                "error"
            );

        }

    }


    finally {

        setLoading(false);

    }

}


// =========================================================
// 25. DOWNLOAD FILE
// =========================================================

function downloadFile(
    blob,
    filename
) {

    // Create temporary URL

    const url =
        window.URL.createObjectURL(
            blob
        );


    // Create download link

    const link =
        document.createElement(
            "a"
        );


    link.href = url;

    link.download = filename;


    // Add to page

    document.body.appendChild(
        link
    );


    // Start download

    link.click();


    // Remove link

    link.remove();


    // Release memory

    window.URL.revokeObjectURL(
        url
    );

}


// =========================================================
// 26. UPDATE UI
// =========================================================

function updateUI() {


    // =====================================================
    // PDF MODE
    // =====================================================

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


    // =====================================================
    // IMAGE MODE
    // =====================================================

    else {

        pageTitle.textContent =
            "Merge Images";


        pageSubtitle.textContent =
            "Combine multiple images into one PDF.";


        uploadTitle.textContent =
            "Drop image files here";


        uploadText.textContent =
            "or click to select images";


        filesTitle.textContent =
            "Image Files";


        fileInput.accept =
            ".jpg,.jpeg,.png";


        mergeBtnText.textContent =
            "Merge Images & Download";

    }


    // Refresh file list

    renderFiles();

    updateMergeButton();

}


// =========================================================
// 27. UPDATE FILE COUNT
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
// 28. UPDATE MERGE BUTTON
// =========================================================

function updateMergeButton() {

    // Merge button is enabled
    // only when there are 2 or more files.

    mergeBtn.disabled =
        files.length < 2;

}


// =========================================================
// 29. LOADING STATE
// =========================================================

function setLoading(
    loading
) {


    if (
        loading
    ) {

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
// 30. STATUS MESSAGE
// =========================================================

function showStatus(
    message,
    type
) {

    statusMessage.textContent =
        message;


    statusMessage.className =
        `status-message ${type}`;

}


// =========================================================
// 31. FILE SIZE
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


    const size =
        bytes /
        Math.pow(
            1024,
            index
        );


    return (
        size.toFixed(2)
        +
        " "
        +
        units[index]
    );

}


// =========================================================
// 32. ESCAPE HTML
// =========================================================
//
// Prevents file names from being
// interpreted as HTML.
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
