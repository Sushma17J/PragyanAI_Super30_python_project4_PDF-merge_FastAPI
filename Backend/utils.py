import io
import os

from PIL import Image
from pypdf import PdfReader, PdfWriter


# =========================================================
# CHECK PDF
# =========================================================

def is_pdf(filename):

    extension = os.path.splitext(filename)[1].lower()

    return extension == ".pdf"


# =========================================================
# CHECK IMAGE
# =========================================================

def is_image(filename):

    extension = os.path.splitext(filename)[1].lower()

    return extension in [
        ".jpg",
        ".jpeg",
        ".png"
    ]


# =========================================================
# MERGE PDF FILES
# =========================================================

def merge_pdf_files(file_data_list):

    # Create PDF writer
    writer = PdfWriter()


    # Process files in the order
    # received from frontend

    for file_data in file_data_list:

        # Convert bytes into file object
        pdf_stream = io.BytesIO(file_data)

        # Read PDF
        reader = PdfReader(pdf_stream)


        # Add every page
        for page in reader.pages:

            writer.add_page(page)


    # Create output PDF in memory

    output = io.BytesIO()

    writer.write(output)

    output.seek(0)


    return output


# =========================================================
# MERGE IMAGE FILES
# =========================================================

def merge_image_files(file_data_list):

    # Create PDF writer

    writer = PdfWriter()


    # Process images in frontend order

    for file_data in file_data_list:

        # Read image

        image_stream = io.BytesIO(file_data)

        image = Image.open(image_stream)


        # Convert to RGB

        if image.mode != "RGB":

            image = image.convert("RGB")


        # Convert image to PDF

        pdf_stream = io.BytesIO()

        image.save(
            pdf_stream,
            format="PDF"
        )

        pdf_stream.seek(0)


        # Read generated PDF

        reader = PdfReader(pdf_stream)


        # Add pages

        for page in reader.pages:

            writer.add_page(page)


    # Create final PDF

    output = io.BytesIO()

    writer.write(output)

    output.seek(0)


    return output
