"""
MergeFlow - FastAPI Backend

This API provides:
    /merge/pdf
        Merge multiple PDF files.

    /merge/images
        Convert multiple images into
        one combined PDF.

The frontend is hosted on Netlify
and this backend is hosted on Render.
"""

import json
import os

from fastapi import (
    FastAPI,
    UploadFile,
    File,
    HTTPException
)

from fastapi.middleware.cors import (
    CORSMiddleware
)

from fastapi.responses import (
    StreamingResponse
)

from utils import (
    merge_pdf_files,
    merge_image_files,
    is_pdf,
    is_image
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

    config = json.load(
        config_file
    )


APP_NAME = config.get(
    "app_name",
    "MergeFlow"
)

VERSION = config.get(
    "version",
    "3.0"
)

MAX_FILES = config.get(
    "max_files",
    20
)


# ==========================================================
# CREATE FASTAPI APPLICATION
# ==========================================================

app = FastAPI(

    title=APP_NAME,

    description=(
        "PDF and Image Merger API"
    ),

    version=VERSION
)


# ==========================================================
# CORS
# ==========================================================

# This allows the Netlify frontend
# to communicate with the Render backend.

app.add_middleware(

    CORSMiddleware,

    allow_origins=["*"],

    allow_credentials=True,

    allow_methods=["*"],

    allow_headers=["*"]
)


# ==========================================================
# HOME API
# ==========================================================

@app.get("/")
def home():

    return {

        "message":
            f"{APP_NAME} API is running",

        "version":
            VERSION,

        "status":
            "online"
    }


# ==========================================================
# HEALTH CHECK
# ==========================================================

@app.get("/health")
def health():

    return {

        "status":
            "healthy"
    }


# ==========================================================
# PDF MERGER
# ==========================================================

@app.post("/merge/pdf")
async def merge_pdf(
    files: list[UploadFile] = File(...)
):
    """
    Merge multiple PDF files into
    one PDF.
    """

    # ------------------------------------------------------
    # Check whether files exist
    # ------------------------------------------------------

    if not files:

        raise HTTPException(

            status_code=400,

            detail=(
                "Please upload at least "
                "one PDF file."
            )
        )


    # ------------------------------------------------------
    # Maximum number of files
    # ------------------------------------------------------

    if len(files) > MAX_FILES:

        raise HTTPException(

            status_code=400,

            detail=(
                f"Maximum {MAX_FILES} "
                "files are allowed."
            )
        )


    uploaded_files = []


    try:

        # --------------------------------------------------
        # Read files in the order received
        # --------------------------------------------------

        for uploaded_file in files:

            filename = (
                uploaded_file.filename
            )


            if not filename:

                raise HTTPException(

                    status_code=400,

                    detail="Invalid file name."
                )


            # ----------------------------------------------
            # Validate PDF
            # ----------------------------------------------

            if not is_pdf(filename):

                raise HTTPException(

                    status_code=400,

                    detail=(
                        f"{filename} is not "
                        "a PDF file."
                    )
                )


            # ----------------------------------------------
            # Read file
            # ----------------------------------------------

            file_data = (
                await uploaded_file.read()
            )


            if not file_data:

                raise HTTPException(

                    status_code=400,

                    detail=(
                        f"{filename} is empty."
                    )
                )


            uploaded_files.append(

                (
                    filename,
                    file_data
                )
            )


        # --------------------------------------------------
        # Merge PDFs
        # --------------------------------------------------

        output = merge_pdf_files(
            uploaded_files
        )


        # --------------------------------------------------
        # Return PDF
        # --------------------------------------------------

        return StreamingResponse(

            output,

            media_type="application/pdf",

            headers={

                "Content-Disposition":
                (
                    'attachment; '
                    'filename="merged_pdfs.pdf"'
                )
            }
        )


    except HTTPException:

        raise


    except Exception as error:

        print(
            "PDF merge error:",
            error
        )

        raise HTTPException(

            status_code=500,

            detail=(
                "Unable to merge PDF files."
            )
        )


# ==========================================================
# IMAGE MERGER
# ==========================================================

@app.post("/merge/images")
async def merge_images(
    files: list[UploadFile] = File(...)
):
    """
    Convert multiple images into
    one PDF document.
    """

    # ------------------------------------------------------
    # Check files
    # ------------------------------------------------------

    if not files:

        raise HTTPException(

            status_code=400,

            detail=(
                "Please upload at least "
                "one image."
            )
        )


    # ------------------------------------------------------
    # Maximum files
    # ------------------------------------------------------

    if len(files) > MAX_FILES:

        raise HTTPException(

            status_code=400,

            detail=(
                f"Maximum {MAX_FILES} "
                "images are allowed."
            )
        )


    uploaded_files = []


    try:

        # --------------------------------------------------
        # Read images
        # --------------------------------------------------

        for uploaded_file in files:

            filename = (
                uploaded_file.filename
            )


            if not filename:

                raise HTTPException(

                    status_code=400,

                    detail="Invalid file name."
                )


            # ----------------------------------------------
            # Validate image
            # ----------------------------------------------

            if not is_image(filename):

                raise HTTPException(

                    status_code=400,

                    detail=(
                        f"{filename} is not "
                        "a supported image."
                    )
                )


            # ----------------------------------------------
            # Read image
            # ----------------------------------------------

            file_data = (
                await uploaded_file.read()
            )


            if not file_data:

                raise HTTPException(

                    status_code=400,

                    detail=(
                        f"{filename} is empty."
                    )
                )


            uploaded_files.append(

                (
                    filename,
                    file_data
                )
            )


        # --------------------------------------------------
        # Merge images
        # --------------------------------------------------

        output = merge_image_files(
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
                (
                    'attachment; '
                    'filename="merged_images.pdf"'
                )
            }
        )


    except HTTPException:

        raise


    except Exception as error:

        print(
            "Image merge error:",
            error
        )

        raise HTTPException(

            status_code=500,

            detail=(
                "Unable to merge images."
            )
        )
