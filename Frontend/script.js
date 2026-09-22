// ==========================================================
// CONFIGURATION
// ==========================================================

// LOCAL DEVELOPMENT
// Change this to your Render URL after deployment.

const API_URL =
    "http://127.0.0.1:8000";


// ==========================================================
// ELEMENTS
// ==========================================================

const fileInput =
    document.getElementById(
        "fileInput"
    );

const uploadCard =
    document.getElementById(
        "uploadCard"
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

const clearWorkspace =
    document.getElementById(
        "clearWorkspace"
    );

const message =
    document.getElementById(
        "message"
    );


// ==========================================================
// VARIABLES
// ==========================================================

let files = [];

let selectedIndex = null;


// ==========================================================
// ALLOWED FILE TYPES
// ==========================================================

const allowedExtensions = [
    "pdf",
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

        addFiles(selectedFiles);

        // Allow selecting the same file again
        event.target.value = "";

    }
);


// ==========================================================
// DRAG & DROP
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


uploadArea.addEventListener(
    "dragleave",
    function () {

        uploadArea.classList.remove(
            "dragover"
        );

    }
);


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

        addFiles(droppedFiles);

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


            if (
                !allowedExtensions.includes(
                    extension
                )
            ) {

                rejectedCount++;

                return;
            }


            files.push(file);

            addedCount++;

        }
    );


    selectedIndex = null;

    renderFiles();


    if (addedCount > 0) {

        showMessage(
            `${addedCount} file(s) added successfully.`,
            "success"
        );

    }


    if (rejectedCount > 0) {

        showMessage(
            "Some files were rejected. Only PDF, JPG, JPEG and PNG files are allowed.",
            "error"
        );

    }

}


// ==========================================================
// RENDER FILES
// ==========================================================

function renderFiles() {

    fileList.innerHTML = "";


    if (files.length === 0) {

        fileList.appendChild(
            emptyState
        );

        emptyState.style.display =
            "block";

    }

    else {

        emptyState.style.display =
            "none";


        files.forEach(
            function (file, index) {

                const row =
                    document.createElement(
                        "div"
                    );


                row.className =
                    "file-row";


                if (
                    selectedIndex === index
                ) {

                    row.classList.add(
                        "selected"
                    );

                }


                row.addEventListener(
                    "click",
                    function () {

                        selectFile(index);

                    }
                );


                // ==========================================
                // NUMBER
                // ==========================================

                const number =
                    document.createElement(
                        "div"
                    );

                number.className =
                    "file-number";

                number.textContent =
                    index + 1;


                // ==========================================
                // ICON
                // ==========================================

                const icon =
                    document.createElement(
                        "div"
                    );

                icon.className =
                    "file-icon";

                icon.textContent =
                    getFileIcon(file);


                // ==========================================
                // INFO
                // ==========================================

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


                // ==========================================
                // REMOVE BUTTON
                // ==========================================

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

                        removeFile(index);

                    }
                );


                // ==========================================
                // ADD ELEMENTS
                // ==========================================

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

    selectedIndex = index;

    renderFiles();

}


// ==========================================================
// REMOVE FILE
// ==========================================================

function removeFile(index) {

    const removedFile =
        files[index];


    files.splice(
        index,
        1
    );


    if (
        selectedIndex === index
    ) {

        selectedIndex = null;

    }

    else if (
        selectedIndex !== null &&
        selectedIndex > index
    ) {

        selectedIndex--;

    }


    renderFiles();


    showMessage(
        `${removedFile.name} removed.`,
        "success"
    );

}


// ==========================================================
// REMOVE ALL
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
        "All files removed.",
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


        const current =
            files[selectedIndex];


        files[selectedIndex] =
            files[selectedIndex - 1];


        files[selectedIndex - 1] =
            current;


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


        const current =
            files[selectedIndex];


        files[selectedIndex] =
            files[selectedIndex + 1];


        files[selectedIndex + 1] =
            current;


        selectedIndex++;


        renderFiles();

    }
);


// ==========================================================
// MERGE
// ==========================================================

mergeButton.addEventListener(
    "click",
    async function () {

        if (
            files.length === 0
        ) {

            showMessage(
                "Please upload at least one file.",
                "error"
            );

            return;
        }


        setLoading(true);


        try {

            const formData =
                new FormData();


            // Important:
            // Files are appended in the exact
            // order displayed in the frontend.

            files.forEach(
                function (file) {

                    formData.append(
                        "files",
                        file
                    );

                }
            );


            const response =
                await fetch(
                    `${API_URL}/merge`,
                    {
                        method: "POST",
                        body: formData
                    }
                );


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


            const blob =
                await response.blob();


            // ==============================================
            // DOWNLOAD
            // ==============================================

            const downloadUrl =
                window.URL.createObjectURL(
                    blob
                );


            const link =
                document.createElement(
                    "a"
                );


            link.href =
                downloadUrl;


            link.download =
                "merged_files.pdf";


            document.body.appendChild(
                link
            );


            link.click();


            link.remove();


            window.URL.revokeObjectURL(
                downloadUrl
            );


            showMessage(
                "PDF merged successfully. Your download has started.",
                "success"
            );

        }


        catch (error) {

            console.error(
                error
            );


            showMessage(
                error.message ||
                "Something went wrong.",
                "error"
            );

        }


        finally {

            setLoading(false);

        }

    }
);


// ==========================================================
// LOADING STATE
// ==========================================================

function setLoading(
    loading
) {

    mergeButton.disabled =
        loading ||
        files.length === 0;


    if (loading) {

        mergeButton.innerHTML =
            `
            <span>⏳</span>
            Merging files...
            `;

    }

    else {

        mergeButton.innerHTML =
            `
            <span>✦</span>
            Merge & Download PDF
            `;

    }

}


// ==========================================================
// UPDATE CONTROLS
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
        ) +
        " " +
        units[index]
    );

}


// ==========================================================
// MESSAGE
// ==========================================================

function showMessage(
    text,
    type
) {

    message.textContent =
        text;


    message.className =
        `message ${type}`;


    setTimeout(
        function () {

            message.className =
                "message";

        },
        4000
    );

}


// ==========================================================
// INITIAL RENDER
// ==========================================================

renderFiles();
