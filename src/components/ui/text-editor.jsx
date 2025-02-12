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
        ["image"],
        [{ color: [] }, { background: [] }],
        ["link"],
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
    const [editorInstance, setEditorInstance] = useState(null);

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
                    const quill = quillRef.current.getEditor(); // Accessing the editor instance
                    const range = quill.getSelection();
                    quill.insertEmbed(range.index, "image", imageUrl); // Insert the image into the editor
                } catch (error) {
                    console.error("Error uploading image to Cloudinary", error);
                }
            }
        };
    };

    // Set up the image handler after the editor mounts
    useEffect(() => {
        if (quillRef.current) {
            const quill = quillRef.current.getEditor();
            const toolbar = quill.getModule("toolbar");
            toolbar.addHandler("image", imageHandler); // Attach the image handler to the toolbar
            setEditorInstance(quill);
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
