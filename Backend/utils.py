import io
import os

from PIL import Image
from pypdf import PdfReader, PdfWriter


ALLOWED_EXTENSIONS = {
    ".pdf",
    ".jpg",
    ".jpeg",
    ".png"
}


def is_allowed_file(filename):
    """
    Check whether the uploaded file has
    an allowed extension.
    """

    extension = os.path.splitext(filename)[1].lower()

    return extension in ALLOWED_EXTENSIONS


def add_pdf_to_writer(file_data, writer):
    """
    Add all pages from a PDF to PdfWriter.
    """

    pdf_stream = io.BytesIO(file_data)

    reader = PdfReader(pdf_stream)

    for page in reader.pages:
        writer.add_page(page)


def add_image_to_writer(file_data, writer):
    """
    Convert image to PDF and add it to PdfWriter.
    """

    image_stream = io.BytesIO(file_data)

    image = Image.open(image_stream)

    # Convert RGBA / P / other modes to RGB
    if image.mode != "RGB":
        image = image.convert("RGB")

    pdf_stream = io.BytesIO()

    image.save(
        pdf_stream,
        format="PDF"
    )

    pdf_stream.seek(0)

    reader = PdfReader(pdf_stream)

    for page in reader.pages:
        writer.add_page(page)


def merge_files(uploaded_files):
    """
    Merge PDFs and images in the same order
    as they were uploaded.
    """

    writer = PdfWriter()

    for filename, file_data in uploaded_files:

        extension = os.path.splitext(
            filename
        )[1].lower()

        if extension == ".pdf":

            add_pdf_to_writer(
                file_data,
                writer
            )

        elif extension in {
            ".jpg",
            ".jpeg",
            ".png"
        }:

            add_image_to_writer(
                file_data,
                writer
            )

        else:

            raise ValueError(
                f"Unsupported file type: {filename}"
            )

    output = io.BytesIO()

    writer.write(output)

    output.seek(0)

    return output
