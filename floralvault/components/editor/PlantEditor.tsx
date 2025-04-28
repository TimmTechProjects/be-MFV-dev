"use client";

import { useEditor, EditorContent } from "@tiptap/react";
import StarterKit from "@tiptap/starter-kit";
import Bold from "@tiptap/extension-bold";
import Italic from "@tiptap/extension-italic";
import Underline from "@tiptap/extension-underline";
import Strike from "@tiptap/extension-strike";
import Link from "@tiptap/extension-link";
import BulletList from "@tiptap/extension-bullet-list";
import OrderedList from "@tiptap/extension-ordered-list";
import ListItem from "@tiptap/extension-list-item";
import Heading from "@tiptap/extension-heading";
// import Highlight from "@tiptap/extension-highlight";
import TextAlign from "@tiptap/extension-text-align";
import { useEffect } from "react";
import { cn } from "@/lib/utils";

interface PlantEditorProps {
  content: string;
  onChange: (value: string) => void;
}

const PlantEditor = ({ content, onChange }: PlantEditorProps) => {
  const editor = useEditor({
    extensions: [
      StarterKit.configure({
        heading: false,
      }),
      Heading.configure({ levels: [1, 2, 3] }),
      Bold,
      Italic,
      Underline,
      Strike,
      Link.configure({ openOnClick: false }),
      BulletList,
      OrderedList,
      ListItem,
      // Highlight,
      TextAlign.configure({ types: ["heading", "paragraph"] }),
    ],
    content,
    onUpdate: ({ editor }) => {
      onChange(editor.getHTML());
    },
    editorProps: {
      attributes: {
        class: cn(
          "tiptap prose dark:prose-invert prose-sm sm:prose lg:prose-lg",
          "px-4 py-3 min-h-[300px] focus:outline-none",
          "bg-transparent dark:bg-zinc-800 text-foreground",
          "rounded-md",
          "border-none",
          "outline-none",
          "text-white"
        ),
      },
    },
  });

  useEffect(() => {
    if (editor && content !== editor.getHTML()) {
      editor.commands.setContent(content);
    }
  }, [content, editor]);

  if (!editor) return null;

  const buttons = [
    {
      label: "H1",
      command: () => editor.chain().focus().toggleHeading({ level: 1 }).run(),
      active: editor.isActive("heading", { level: 1 }),
    },
    {
      label: "H2",
      command: () => editor.chain().focus().toggleHeading({ level: 2 }).run(),
      active: editor.isActive("heading", { level: 2 }),
    },
    {
      label: "H3",
      command: () => editor.chain().focus().toggleHeading({ level: 3 }).run(),
      active: editor.isActive("heading", { level: 3 }),
    },
    {
      label: "P",
      command: () => editor.chain().focus().setParagraph().run(),
      active: editor.isActive("paragraph"),
    },
    {
      label: "Bold",
      command: () => editor.chain().focus().toggleBold().run(),
      active: editor.isActive("bold"),
    },
    {
      label: "Italic",
      command: () => editor.chain().focus().toggleItalic().run(),
      active: editor.isActive("italic"),
    },
    {
      label: "Strike",
      command: () => editor.chain().focus().toggleStrike().run(),
      active: editor.isActive("strike"),
    },
    {
      label: "Bullets",
      command: () => editor.chain().focus().toggleBulletList().run(),
      active: editor.isActive("bulletList"),
    },
    {
      label: "Numbers",
      command: () => editor.chain().focus().toggleOrderedList().run(),
      active: editor.isActive("orderedList"),
    },
    {
      label: "Left",
      command: () => editor.chain().focus().setTextAlign("left").run(),
      active: editor.isActive({ textAlign: "left" }),
    },
    {
      label: "Center",
      command: () => editor.chain().focus().setTextAlign("center").run(),
      active: editor.isActive({ textAlign: "center" }),
    },
    {
      label: "Right",
      command: () => editor.chain().focus().setTextAlign("right").run(),
      active: editor.isActive({ textAlign: "right" }),
    },
    {
      label: "Justify",
      command: () => editor.chain().focus().setTextAlign("justify").run(),
      active: editor.isActive({ textAlign: "justify" }),
    },
    {
      label: "Link",
      command: () => {
        const url = prompt("Enter link");
        if (url)
          editor.chain().focus().setLink({ href: url, target: "_blank" }).run();
      },
      active: false,
    },
  ];

  return (
    <div className="w-full space-y-3">
      <div
        className="flex flex-wrap gap-1 items-center justify-center rounded-4xl p-2 bg-zinc-800/40 backdrop-blur-sm
"
      >
        {buttons.map(({ label, command, active }) => (
          <button
            key={label}
            onClick={command}
            type="button"
            className={cn(
              "text-xs font-medium px-3 py-1 rounded-4xl transition-all",
              active
                ? "bg-purple-600 text-white"
                : "bg-transparent dark:bg-zinc-800 dark:text-white hover:bg-purple-500 cursor-pointer"
            )}
          >
            {label}
          </button>
        ))}
      </div>
      <div className="text-black rounded-md bg-transparent dark:bg-zinc-900 shadow-sm">
        <EditorContent editor={editor} />
      </div>
    </div>
  );
};

export default PlantEditor;
