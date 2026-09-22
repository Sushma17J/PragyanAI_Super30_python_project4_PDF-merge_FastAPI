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
    merge_files,
    is_allowed_file
)


# ==========================================================
# LOAD CONFIGURATION
# ==========================================================

BASE_DIR = os.path.dirname(
    os.path.abspath(__file__)
)

CONFIG_PATH = os.path.join(
    BASE_DIR,
    "config.json"
)


with open(
    CONFIG_PATH,
    "r",
    encoding="utf-8"
) as config_file:

    config = json.load(config_file)


APP_NAME = config.get(
    "app_name",
    "MergeFlow"
)

VERSION = config.get(
    "version",
    "2.0"
)

MAX_FILES = config.get(
    "max_files",
    20
)


# ==========================================================
# FASTAPI APPLICATION
# ==========================================================

app = FastAPI(
    title=APP_NAME,
    version=VERSION,
    description="Modern PDF and Image Merger API"
)


# ==========================================================
# CORS
# ==========================================================

app.add_middleware(
    CORSMiddleware,

    allow_origins=["*"],

    allow_credentials=True,

    allow_methods=["*"],

    allow_headers=["*"]
)


# ==========================================================
# HOME
# ==========================================================

@app.get("/")
def home():

    return {
        "message": f"{APP_NAME} API is running",
        "version": VERSION,
        "status": "online"
    }


# ==========================================================
# HEALTH CHECK
# ==========================================================

@app.get("/health")
def health():

    return {
        "status": "healthy"
    }


# ==========================================================
# MERGE FILES
# ==========================================================

@app.post("/merge")
async def merge_pdf_files(
    files: list[UploadFile] = File(...)
):

    # ------------------------------------------------------
    # Check files
    # ------------------------------------------------------

    if not files:

        raise HTTPException(
            status_code=400,
            detail="Please upload at least one file."
        )


    # ------------------------------------------------------
    # Maximum file limit
    # ------------------------------------------------------

    if len(files) > MAX_FILES:

        raise HTTPException(
            status_code=400,
            detail=f"Maximum {MAX_FILES} files are allowed."
        )


    uploaded_files = []


    try:

        # --------------------------------------------------
        # Read every file
        # --------------------------------------------------

        for uploaded_file in files:

            filename = uploaded_file.filename

            if not filename:

                raise HTTPException(
                    status_code=400,
                    detail="Invalid file name."
                )


            # ----------------------------------------------
            # Validate extension
            # ----------------------------------------------

            if not is_allowed_file(filename):

                raise HTTPException(
                    status_code=400,
                    detail=(
                        f"Unsupported file type: {filename}. "
                        "Only PDF, JPG, JPEG and PNG are allowed."
                    )
                )


            # ----------------------------------------------
            # Read file data
            # ----------------------------------------------

            file_data = await uploaded_file.read()


            if not file_data:

                raise HTTPException(
                    status_code=400,
                    detail=f"Empty file: {filename}"
                )


            uploaded_files.append(
                (
                    filename,
                    file_data
                )
            )


        # --------------------------------------------------
        # Merge
        # --------------------------------------------------

        output = merge_files(
            uploaded_files
        )


        # --------------------------------------------------
        # Return merged PDF
        # --------------------------------------------------

        return StreamingResponse(

            output,

            media_type="application/pdf",

            headers={
                "Content-Disposition":
                'attachment; filename="merged_files.pdf"'
            }
        )


    except HTTPException:
        raise


    except Exception as error:

        print(
            "Merge error:",
            error
        )

        raise HTTPException(
            status_code=500,
            detail="Unable to merge the files."
        )
