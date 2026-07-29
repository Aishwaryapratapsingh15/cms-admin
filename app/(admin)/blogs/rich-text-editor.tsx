"use client";

import { forwardRef } from "react";
import {
  MDXEditor,
  type MDXEditorMethods,
  headingsPlugin,
  listsPlugin,
  quotePlugin,
  thematicBreakPlugin,
  linkPlugin,
  linkDialogPlugin,
  imagePlugin,
  tablePlugin,
  codeBlockPlugin,
  codeMirrorPlugin,
  markdownShortcutPlugin,
  toolbarPlugin,
  UndoRedo,
  BoldItalicUnderlineToggles,
  StrikeThroughSupSubToggles,
  BlockTypeSelect,
  ListsToggle,
  CreateLink,
  InsertTable,
  InsertThematicBreak,
  CodeToggle,
  Separator,
} from "@mdxeditor/editor";
import "@mdxeditor/editor/style.css";

export const RichTextEditor = forwardRef<
  MDXEditorMethods,
  {
    markdown: string;
    onChange: (value: string) => void;
    placeholder?: string;
  }
>(function RichTextEditor({ markdown, onChange, placeholder }, ref) {
  return (
    <div className="rich-text-editor rounded-lg border border-input">
      <MDXEditor
        ref={ref}
        markdown={markdown}
        onChange={onChange}
        placeholder={placeholder}
        contentEditableClassName="prose prose-neutral min-h-64 max-w-none px-3 py-3 text-sm focus:outline-none"
        plugins={[
          headingsPlugin(),
          listsPlugin(),
          quotePlugin(),
          thematicBreakPlugin(),
          linkPlugin(),
          linkDialogPlugin(),
          imagePlugin(),
          tablePlugin(),
          codeBlockPlugin({ defaultCodeBlockLanguage: "text" }),
          codeMirrorPlugin({
            codeBlockLanguages: {
              text: "Plain text",
              js: "JavaScript",
              ts: "TypeScript",
              css: "CSS",
              html: "HTML",
              json: "JSON",
              bash: "Bash",
            },
          }),
          markdownShortcutPlugin(),
          toolbarPlugin({
            toolbarContents: () => (
              <>
                <UndoRedo />
                <Separator />
                <BoldItalicUnderlineToggles />
                <StrikeThroughSupSubToggles />
                <CodeToggle />
                <Separator />
                <BlockTypeSelect />
                <Separator />
                <ListsToggle />
                <Separator />
                <CreateLink />
                <InsertTable />
                <InsertThematicBreak />
              </>
            ),
          }),
        ]}
      />
    </div>
  );
});
