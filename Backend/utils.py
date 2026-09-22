"""
MergeFlow - File Processing Utilities

This file contains all helper functions required for:
1. Validating uploaded files
2. Merging PDF files
3. Converting images into PDF pages
4. Creating the final merged PDF
"""

import io
import os

from PIL import Image
from pypdf import PdfReader, PdfWriter


# ==========================================================
# ALLOWED FILE EXTENSIONS
# ==========================================================

PDF_EXTENSIONS = {
    ".pdf"
}

IMAGE_EXTENSIONS = {
    ".jpg",
    ".jpeg",
    ".png"
}


# ==========================================================
# CHECK PDF FILE
# ==========================================================

def is_pdf(filename):
    """
    Returns True if the file is a PDF.
    """

    extension = os.path.splitext(
        filename
    )[1].lower()

    return extension in PDF_EXTENSIONS


# ==========================================================
# CHECK IMAGE FILE
# ==========================================================

def is_image(filename):
    """
    Returns True if the file is an image.
    """

    extension = os.path.splitext(
        filename
    )[1].lower()

    return extension in IMAGE_EXTENSIONS


# ==========================================================
# ADD PDF TO WRITER
# ==========================================================

def add_pdf_to_writer(
    file_data,
    writer
):
    """
    Reads a PDF from memory and adds
    all its pages to PdfWriter.
    """

    pdf_stream = io.BytesIO(
        file_data
    )

    reader = PdfReader(
        pdf_stream
    )

    for page in reader.pages:

        writer.add_page(
            page
        )


# ==========================================================
# ADD IMAGE TO WRITER
# ==========================================================

def add_image_to_writer(
    file_data,
    writer
):
    """
    Converts an image into a PDF page
    and adds it to PdfWriter.
    """

    image_stream = io.BytesIO(
        file_data
    )

    image = Image.open(
        image_stream
    )

    # Convert image to RGB.
    # This is required for PDF generation.
    if image.mode != "RGB":

        image = image.convert(
            "RGB"
        )

    # Create an in-memory PDF
    pdf_stream = io.BytesIO()

    image.save(
        pdf_stream,
        format="PDF"
    )

    pdf_stream.seek(0)

    # Read the generated PDF
    reader = PdfReader(
        pdf_stream
    )

    # Add generated page(s)
    for page in reader.pages:

        writer.add_page(
            page
        )


# ==========================================================
# MERGE PDF FILES
# ==========================================================

def merge_pdf_files(
    uploaded_files
):
    """
    Merge only PDF files.

    uploaded_files:
        [
            ("file1.pdf", file_data),
            ("file2.pdf", file_data)
        ]
    """

    writer = PdfWriter()

    for filename, file_data in uploaded_files:

        if not is_pdf(filename):

            raise ValueError(
                f"{filename} is not a PDF file."
            )

        add_pdf_to_writer(
            file_data,
            writer
        )

    output = io.BytesIO()

    writer.write(
        output
    )

    output.seek(0)

    return output


# ==========================================================
# MERGE IMAGE FILES
# ==========================================================

def merge_image_files(
    uploaded_files
):
    """
    Convert multiple images into PDF pages
    and combine them into one PDF.
    """

    writer = PdfWriter()

    for filename, file_data in uploaded_files:

        if not is_image(filename):

            raise ValueError(
                f"{filename} is not an image file."
            )

        add_image_to_writer(
            file_data,
            writer
        )

    output = io.BytesIO()

    writer.write(
        output
    )

    output.seek(0)

    return output
