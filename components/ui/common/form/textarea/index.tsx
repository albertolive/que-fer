import { Editor } from "@tinymce/tinymce-react";

export default function TextArea({ id, value = "", onChange }) {
  const handleEditorChange = (content) => {
    onChange({ target: { name: id, value: content } });
  };

  return (
    <div className="w-full">
      <label htmlFor={id} className="text-blackCorp font-bold">
        Descripció *
      </label>
      <div className="mt-2">
        <Editor
          id={id}
          value={value}
          apiKey={process.env.NEXT_PUBLIC_TINY}
          init={{
            language: "ca",
            height: 300,
            menubar: false,
            plugins: [
              "advlist autolink lists link image charmap print preview anchor",
              "searchreplace visualblocks code fullscreen",
              "insertdatetime media table paste code help wordcount",
            ],
            toolbar:
              "undo redo | formatselect | bold italic backcolor | \
              alignleft aligncenter alignright alignjustify | \
              bullist numlist outdent indent | removeformat | help",
          }}
          onEditorChange={handleEditorChange}
        />
      </div>
    </div>
  );
}
