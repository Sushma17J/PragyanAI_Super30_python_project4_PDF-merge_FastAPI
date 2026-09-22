import io
import os

from PIL import Image
from pypdf import PdfReader, PdfWriter


# =========================================================
# FILE EXTENSIONS
# =========================================================

PDF_EXTENSIONS = {
    ".pdf"
}

IMAGE_EXTENSIONS = {
    ".jpg",
    ".jpeg",
    ".png"
}


# =========================================================
# CHECK PDF
# =========================================================

def is_pdf(filename: str) -> bool:

    extension = os.path.splitext(filename)[1].lower()

    return extension in PDF_EXTENSIONS


# =========================================================
# CHECK IMAGE
# =========================================================

def is_image(filename: str) -> bool:

    extension = os.path.splitext(filename)[1].lower()

    return extension in IMAGE_EXTENSIONS


# =========================================================
# ADD PDF TO WRITER
# =========================================================

def add_pdf_to_writer(
    file_data: bytes,
    writer: PdfWriter
):

    # Convert bytes into a file-like object
    pdf_stream = io.BytesIO(file_data)

    # Read PDF
    reader = PdfReader(pdf_stream)

    # Add every page
    for page in reader.pages:

        writer.add_page(page)


# =========================================================
# ADD IMAGE TO PDF
# =========================================================

def add_image_to_writer(
    file_data: bytes,
    writer: PdfWriter
):

    # Read image
    image_stream = io.BytesIO(file_data)

    image = Image.open(image_stream)

    # Convert image to RGB
    # Required for PDF conversion
    if image.mode != "RGB":

        image = image.convert("RGB")


    # Temporary PDF in memory
    pdf_stream = io.BytesIO()

    # Convert image to PDF
    image.save(
        pdf_stream,
        format="PDF"
    )

    pdf_stream.seek(0)


    # Read generated PDF
    reader = PdfReader(pdf_stream)


    # Add page to final PDF
    for page in reader.pages:

        writer.add_page(page)


# =========================================================
# MERGE PDF FILES
# =========================================================

def merge_pdf_files(uploaded_files):

    writer = PdfWriter()


    # IMPORTANT:
    # uploaded_files are already in frontend order

    for file_data in uploaded_files:

        add_pdf_to_writer(
            file_data,
            writer
        )


    # Create output in memory
    output = io.BytesIO()

    writer.write(output)

    output.seek(0)

    return output


# =========================================================
# MERGE IMAGE FILES
# =========================================================

def merge_image_files(uploaded_files):

    writer = PdfWriter()


    # Images are processed
    # in the order received

    for file_data in uploaded_files:

        add_image_to_writer(
            file_data,
            writer
        )


    # Create output
    output = io.BytesIO()

    writer.write(output)

    output.seek(0)

    return output
