"use client";

import ImageResize from "quill-image-resize-module-react"; // Import image resize module
import { useEffect, useRef, useState } from "react";
import ReactQuill, { Quill } from "react-quill-new";
import "react-quill-new/dist/quill.snow.css"; // Import styles

// Register the ImageResize module
Quill.register("modules/imageResize", ImageResize);

// Define toolbar options
const modules = {
    toolbar: [
        [{ header: "1" }, { header: "2" }, { font: [] }],
        [{ list: "ordered" }, { list: "bullet" }],
        [{ align: [] }],
        ["bold", "italic", "underline"],
        ["image", "link"], // Include link option in the toolbar
        [{ color: [] }, { background: [] }],
    ],
    imageResize: {
        modules: ["Resize", "DisplaySize", "Toolbar"], // Enable resizing
    },
};

const formats = [
    "header",
    "font",
    "list",
    "align",
    "bold",
    "italic",
    "underline",
    "image",
    "color",
    "background",
    "link",
];

const Editor = ({ editorContent, handleChange }) => {
    const quillRef = useRef(null); // Reference to ReactQuill

    const uploadToCloudinary = async (file) => {
        const imageFormData = new FormData();
        imageFormData.append("file", file);
        imageFormData.append("upload_preset", "ml_default");

        const response = await fetch(
            "https://api.cloudinary.com/v1_1/dnfd5idsi/image/upload",
            {
                method: "POST",
                body: imageFormData,
            }
        );
        const data = await response.json();
        return data.secure_url;
    };

    // Handle image upload
    const imageHandler = () => {
        const input = document.createElement("input");
        input.setAttribute("type", "file");
        input.setAttribute("accept", "image/*");
        input.click();

        input.onchange = async () => {
            const file = input.files[0];
            if (file) {
                try {
                    const imageUrl = await uploadToCloudinary(file);
                    const quill = quillRef.current.getEditor();
                    const range = quill.getSelection();
                    
                    // Insert image with a custom class
                    quill.insertEmbed(range.index, "image", imageUrl);
                    
                    // Apply inline styles after insertion
                    setTimeout(() => {
                        const images = document.querySelectorAll(".ql-editor img");
                        images.forEach(img => {
                            img.style.display = "inline-block";
                            img.style.marginRight = "10px";
                        });
                    }, 100);
                } catch (error) {
                    console.error("Error uploading image to Cloudinary", error);
                }
            }
        };
    };

    // Handle hyperlink insertion
    const linkHandler = () => {
        const quill = quillRef.current.getEditor();
        const range = quill.getSelection();
        if (range) {
            const url = prompt("Enter the URL:");
            if (url) {
                quill.format("link", url);
            }
        }
    };

    // Set up handlers after the editor mounts
    useEffect(() => {
        if (quillRef.current) {
            const quill = quillRef.current.getEditor();
            const toolbar = quill.getModule("toolbar");
            toolbar.addHandler("image", imageHandler);
            toolbar.addHandler("link", linkHandler);
        }
    }, []);

    return (
        <div className="editor-container w-full mb-10">
            <ReactQuill
                className="h-[30rem]"
                ref={quillRef}
                value={editorContent}
                onChange={handleChange}
                modules={modules}
                formats={formats}
                placeholder="Start writing..."
            />
        </div>
    );
};

export default Editor;
