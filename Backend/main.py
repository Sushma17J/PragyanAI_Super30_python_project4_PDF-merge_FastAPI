import json

from fastapi import (
    FastAPI,
    UploadFile,
    File,
    HTTPException
)

from fastapi.middleware.cors import CORSMiddleware

from fastapi.responses import StreamingResponse

from utils import (
    is_pdf,
    is_image,
    merge_pdf_files,
    merge_image_files
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

APP_NAME = config["app_name"]

VERSION = config["version"]

DESCRIPTION = config["description"]

CORS_ORIGINS = config["cors_origins"]

MAX_FILES = config["max_files"]

MAX_UPLOAD_SIZE_MB = config["max_upload_size_mb"]

MAX_UPLOAD_SIZE_BYTES = (
    MAX_UPLOAD_SIZE_MB * 1024 * 1024
)


# =========================================================
# CREATE FASTAPI APP
# =========================================================

app = FastAPI(

    title=APP_NAME,

    version=VERSION,

    description=DESCRIPTION
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
async def home():

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
async def health():

    return {

        "status":
        "healthy"

    }


# =========================================================
# PDF MERGE
# =========================================================

@app.post("/merge/pdf")
async def merge_pdf(

    files: list[UploadFile] = File(...)

):

    # -----------------------------------------------------
    # Minimum files
    # -----------------------------------------------------

    if len(files) < 2:

        raise HTTPException(

            status_code=400,

            detail=
            "Please upload at least 2 PDF files."

        )


    # -----------------------------------------------------
    # Maximum files
    # -----------------------------------------------------

    if len(files) > MAX_FILES:

        raise HTTPException(

            status_code=400,

            detail=
            f"Maximum {MAX_FILES} files allowed."

        )


    pdf_data = []


    # -----------------------------------------------------
    # Read files
    # -----------------------------------------------------

    for file in files:


        # Check filename

        if not file.filename:

            raise HTTPException(

                status_code=400,

                detail="Invalid file."

            )


        # Check extension

        if not is_pdf(file.filename):

            raise HTTPException(

                status_code=400,

                detail=
                f"{file.filename} is not a PDF."

            )


        # Read file

        data = await file.read()


        # Check empty

        if not data:

            raise HTTPException(

                status_code=400,

                detail=
                f"{file.filename} is empty."

            )


        # Check file size

        if len(data) > MAX_UPLOAD_SIZE_BYTES:

            raise HTTPException(

                status_code=400,

                detail=
                f"{file.filename} exceeds "
                f"{MAX_UPLOAD_SIZE_MB} MB."

            )


        # Store PDF

        pdf_data.append(data)


    # -----------------------------------------------------
    # Merge
    # -----------------------------------------------------

    try:

        merged_pdf = merge_pdf_files(
            pdf_data
        )

    except Exception as error:

        print(
            "PDF MERGE ERROR:",
            error
        )

        raise HTTPException(

            status_code=500,

            detail=
            f"PDF merge failed: {str(error)}"

        )


    # -----------------------------------------------------
    # Return merged PDF
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
# IMAGE MERGE
# =========================================================

@app.post("/merge/images")
async def merge_images(

    files: list[UploadFile] = File(...)

):

    # Minimum files

    if len(files) < 2:

        raise HTTPException(

            status_code=400,

            detail=
            "Please upload at least 2 images."

        )


    # Maximum files

    if len(files) > MAX_FILES:

        raise HTTPException(

            status_code=400,

            detail=
            f"Maximum {MAX_FILES} files allowed."

        )


    image_data = []


    # -----------------------------------------------------
    # Read images
    # -----------------------------------------------------

    for file in files:


        if not file.filename:

            raise HTTPException(

                status_code=400,

                detail="Invalid file."

            )


        # Check image extension

        if not is_image(file.filename):

            raise HTTPException(

                status_code=400,

                detail=
                f"{file.filename} is not a supported image."

            )


        # Read image

        data = await file.read()


        # Empty image

        if not data:

            raise HTTPException(

                status_code=400,

                detail=
                f"{file.filename} is empty."

            )


        # Size check

        if len(data) > MAX_UPLOAD_SIZE_BYTES:

            raise HTTPException(

                status_code=400,

                detail=
                f"{file.filename} exceeds "
                f"{MAX_UPLOAD_SIZE_MB} MB."

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

        print(
            "IMAGE MERGE ERROR:",
            error
        )

        raise HTTPException(

            status_code=500,

            detail=
            f"Image merge failed: {str(error)}"

        )


    # -----------------------------------------------------
    # Return PDF
    # -----------------------------------------------------

    return StreamingResponse(

        merged_pdf,

        media_type="application/pdf",

        headers={

            "Content-Disposition":
            'attachment; filename="merged_images.pdf"'

        }

    )
