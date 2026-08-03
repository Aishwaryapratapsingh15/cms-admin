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
  usePublisher,
  insertMarkdown$,
  ButtonWithTooltip,
} from "@mdxeditor/editor";
import "@mdxeditor/editor/style.css";

// Pressing Enter repeatedly to add blank-line spacing doesn't survive
// save/reload: markdown collapses any run of blank lines to one on
// parse+serialize, since blank lines are pure block separators, not content.
// A paragraph containing only a non-breaking-space entity (&#x20;) is real
// content, so it round-trips through save/reload intact.
function InsertSpacer() {
  const insertMarkdown = usePublisher(insertMarkdown$);
  return (
    <ButtonWithTooltip
      title="Insert spacer (a blank line that survives saving)"
      onClick={() => insertMarkdown("&#x20;")}
    >
      <span aria-hidden style={{ fontSize: 14, lineHeight: 1 }}>
        ␣
      </span>
    </ButtonWithTooltip>
  );
}

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
                <Separator />
                <InsertSpacer />
              </>
            ),
          }),
        ]}
      />
    </div>
  );
});
