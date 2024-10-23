import React from "react";
import { useState, useEffect } from "react";
import ReactQuill from "react-quill";
import "react-quill/dist/quill.snow.css";
import "react-quill/dist/quill.bubble.css";
import "./RichTextEditor.css";

const RichTextEditor = ({
  field,
  value,
  sectionName,
  onChange,
  style,
  maxLength,
}) => {
  const [currentValue, setCurrentValue] = useState(value || "");
  const [charCount, setCharCount] = useState(0);

  // Count only real text and not any html tags
  const getTextLength = (htmlContent) => {
    const div = document.createElement("div");
    div.innerHTML = htmlContent;
    if (div.innerText.replace(/\s/g, "") === "") {
      return 0;
    }
    return div.innerText.length;
  };

  useEffect(() => {
    setCurrentValue(value);
    setCharCount(getTextLength(value));
  }, [value]);

  const toolbarOptions = [
    [{ size: ["small", false, "large", "huge"] }],
    ["bold", "italic", "underline", "strike"],
    [{ script: "sub" }, { script: "super" }],
    [{ header: "1" }, { header: "2" }, "blockquote", "code-block"],
    [{ list: "ordered" }, { list: "bullet" }],
    ["clean"],
  ];

  const modules = {
    toolbar: toolbarOptions,
  };

  const formats = [
    "font",
    "size",
    "bold",
    "italic",
    "underline",
    "strike",
    "script",
    "header",
    "blockquote",
    "code-block",
    "list",
  ];

  return (
    <>
      <div style={style}>
        <ReactQuill
          style={{
            backgroundColor: "white",
            left: "0",
          }}
          placeholder={field.placeholder}
          value={value}
          onChange={
            sectionName === "jobOffers"
              ? onChange
              : (value) => {
                  field.onChange(value);
                }
          }
          modules={modules}
          formats={formats}
          theme="bubble"
        />
      </div>
      <div style={{ color: "lightgrey", marginTop: "5px", textAlign: "right" }}>
        {charCount}/{maxLength}
      </div>
    </>
  );
};

export default RichTextEditor;
