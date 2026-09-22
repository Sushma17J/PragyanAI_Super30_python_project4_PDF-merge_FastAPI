import json
import os

from fastapi import (
    FastAPI,
    UploadFile,
    File,
    HTTPException
)

from fastapi.middleware.cors import CORSMiddleware

from fastapi.responses import StreamingResponse

from utils import (
    merge_pdf_files,
    merge_image_files,
    is_pdf,
    is_image
)


# =========================================================
# LOAD CONFIGURATION
# =========================================================

with open(
    "config.json",
    "r",
    encoding="utf-8"
) as config_file:

    config = json.load(config_file)


# =========================================================
# CONFIG VALUES
# =========================================================

APP_NAME = config.get(
    "app_name",
    "PDF Merger"
)

VERSION = config.get(
    "version",
    "1.0.0"
)

CORS_ORIGINS = config.get(
    "cors_origins",
    ["*"]
)

MAX_FILES = config.get(
    "max_files",
    20
)

MAX_UPLOAD_SIZE_MB = config.get(
    "max_upload_size_mb",
    20
)

MAX_UPLOAD_SIZE_BYTES = (
    MAX_UPLOAD_SIZE_MB
    * 1024
    * 1024
)


# =========================================================
# CREATE FASTAPI APP
# =========================================================

app = FastAPI(

    title=APP_NAME,

    version=VERSION,

    description=config.get(
        "description",
        "PDF Merger"
    )
)


# =========================================================
# CORS
# =========================================================

app.add_middleware(

    CORSMiddleware,

    allow_origins=CORS_ORIGINS,

    allow_credentials=False,

    allow_methods=["*"],

    allow_headers=["*"]
)


# =========================================================
# HOME
# =========================================================

@app.get("/")
def home():

    return {

        "message":
        "PragyanAI PDF Merger API is running",

        "version":
        VERSION,

        "status":
        "online"

    }


# =========================================================
# HEALTH CHECK
# =========================================================

@app.get("/health")
def health():

    return {

        "status":
        "healthy"

    }


# =========================================================
# VALIDATE FILE SIZE
# =========================================================

def validate_file_size(
    file_data: bytes,
    filename: str
):

    if len(file_data) > MAX_UPLOAD_SIZE_BYTES:

        raise HTTPException(

            status_code=400,

            detail=(
                f"{filename} exceeds the "
                f"{MAX_UPLOAD_SIZE_MB} MB limit."
            )

        )


# =========================================================
# MERGE PDF
# =========================================================

@app.post("/merge/pdf")
async def merge_pdfs(

    files: list[UploadFile] = File(...)

):

    # -----------------------------------------------------
    # Check number of files
    # -----------------------------------------------------

    if len(files) < 2:

        raise HTTPException(

            status_code=400,

            detail="Please upload at least 2 PDF files."

        )


    if len(files) > MAX_FILES:

        raise HTTPException(

            status_code=400,

            detail=(
                f"You can upload maximum "
                f"{MAX_FILES} files."
            )

        )


    pdf_data = []


    # -----------------------------------------------------
    # Read files in received order
    # -----------------------------------------------------

    for file in files:

        if not file.filename:

            raise HTTPException(

                status_code=400,

                detail="Invalid file."

            )


        # Check extension

        if not is_pdf(file.filename):

            raise HTTPException(

                status_code=400,

                detail=(
                    f"{file.filename} "
                    "is not a PDF file."
                )

            )


        # Read file

        data = await file.read()


        if not data:

            raise HTTPException(

                status_code=400,

                detail=(
                    f"{file.filename} "
                    "is empty."
                )

            )


        # Check size

        validate_file_size(
            data,
            file.filename
        )


        # Store in order

        pdf_data.append(data)


    # -----------------------------------------------------
    # Merge
    # -----------------------------------------------------

    try:

        merged_pdf = merge_pdf_files(
            pdf_data
        )

    except Exception as error:

        raise HTTPException(

            status_code=500,

            detail=(
                f"PDF merge failed: "
                f"{str(error)}"
            )

        )


    # -----------------------------------------------------
    # Send merged PDF
    # -----------------------------------------------------

    return StreamingResponse(

        merged_pdf,

        media_type="application/pdf",

        headers={

            "Content-Disposition":
            'attachment; filename="merged_pdfs.pdf"'

        }

    )


# =========================================================
# MERGE IMAGES
# =========================================================

@app.post("/merge/images")
async def merge_images(

    files: list[UploadFile] = File(...)

):

    # -----------------------------------------------------
    # Check number of files
    # -----------------------------------------------------

    if len(files) < 2:

        raise HTTPException(

            status_code=400,

            detail="Please upload at least 2 images."

        )


    if len(files) > MAX_FILES:

        raise HTTPException(

            status_code=400,

            detail=(
                f"You can upload maximum "
                f"{MAX_FILES} files."
            )

        )


    image_data = []


    # -----------------------------------------------------
    # Read images in frontend order
    # -----------------------------------------------------

    for file in files:

        if not file.filename:

            raise HTTPException(

                status_code=400,

                detail="Invalid file."

            )


        # Check extension

        if not is_image(file.filename):

            raise HTTPException(

                status_code=400,

                detail=(
                    f"{file.filename} "
                    "is not a supported image."
                )

            )


        # Read image

        data = await file.read()


        if not data:

            raise HTTPException(

                status_code=400,

                detail=(
                    f"{file.filename} "
                    "is empty."
                )

            )


        # Check size

        validate_file_size(
            data,
            file.filename
        )


        image_data.append(data)


    # -----------------------------------------------------
    # Merge images
    # -----------------------------------------------------

    try:

        merged_pdf = merge_image_files(
            image_data
        )

    except Exception as error:

        raise HTTPException(

            status_code=500,

            detail=(
                f"Image merge failed: "
                f"{str(error)}"
            )

        )


    # -----------------------------------------------------
    # Download merged PDF
    # -----------------------------------------------------

    return StreamingResponse(

        merged_pdf,

        media_type="application/pdf",

        headers={

            "Content-Disposition":
            'attachment; filename="merged_images.pdf"'

        }

    )
