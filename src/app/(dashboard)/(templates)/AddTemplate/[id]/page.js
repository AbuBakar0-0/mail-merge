"use client";

import { addTemplate } from "@/actions/templates/addTemplate";
import { getTemplate } from "@/actions/templates/getSingleTemplate";
import { updateTemplate } from "@/actions/templates/updateTemplate";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import TextEditor from "@/components/ui/text-editor";
import { useParams } from "next/navigation";
import { useEffect, useState } from "react";
import toast from "react-hot-toast";

function AddTemplate() {
  const { id } = useParams();

  const [editorContent, setEditorContent] = useState("");

  const [name, setName] = useState("");

  const handleChange = (event) => {
    setName(event.target.value);
  };
  const handleEditorChange = (value) => {
    setEditorContent(value);
  };

  useEffect(() => {
    const fetchData = async () => {
      toast.loading("Please Wait");
      const response = await getTemplate(id);
      setName(response.name);
      setEditorContent(response.content);
      toast.dismiss();
    };

    if (id != "new_template") {
      fetchData();
    }
  }, [id]);

  const handleSubmit = async () => {
    toast.loading("Please Wait");
    if (id == "new_template") {
      const response = await addTemplate(
        localStorage.getItem("user_id"),
        name,
        editorContent
      );
    } else {
      const response = await updateTemplate(id, name, editorContent);
    }
    toast.dismiss();
    toast.success("Successfully Completed");
  };

  return (
    <>
      <div className="w-full flex flex-row justify-between items-center mb-5">
        <h1 className="text-3xl font-semibold">
          {id == "new_template" ? "Add" : "Update"} Template
        </h1>
      </div>
      <div className="w-full flex flex-col justify-between items-center gap-4">
        <Input
          type="text"
          name="name"
          value={name}
          onChange={handleChange}
          placeholder="Name"
        />
        <TextEditor
          editorContent={editorContent}
          handleChange={handleEditorChange}
        />
        <Button className="w-full text-white" onClick={() => handleSubmit()}>
          {id == "new_template" ? "Submit" : "Update"}
        </Button>
      </div>
    </>
  );
}

export default AddTemplate;
