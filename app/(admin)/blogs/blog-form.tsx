"use client";

import { useActionState, useEffect, useRef, useState } from "react";
import { toast } from "sonner";
import type { MDXEditorMethods } from "@mdxeditor/editor";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { createBlogAction, updateBlogAction, type ActionState } from "@/lib/actions/blogs";
import type { Blog, BlogStatus, Category, Media, Tag } from "@/lib/types";
import { FeaturedImagePicker } from "./featured-image-picker";
import { InsertImageButton } from "./insert-image-button";
import { RichTextEditor } from "./rich-text-editor";

const initialState: ActionState = {};

const STATUS_OPTIONS: { value: BlogStatus; label: string }[] = [
  { value: "DRAFT", label: "Draft" },
  { value: "PUBLISHED", label: "Published" },
  { value: "SCHEDULED", label: "Scheduled" },
  { value: "ARCHIVED", label: "Archived" },
];

function toDatetimeLocal(value: string | null): string {
  if (!value) return "";
  const date = new Date(value);
  const offsetMs = date.getTimezoneOffset() * 60_000;
  return new Date(date.getTime() - offsetMs).toISOString().slice(0, 16);
}

export function BlogForm({
  blog,
  categories,
  tags,
  media,
  canPublish,
}: {
  blog?: Blog;
  categories: Category[];
  tags: Tag[];
  media: Media[];
  canPublish: boolean;
}) {
  const action = blog ? updateBlogAction.bind(null, blog.id) : createBlogAction;
  const [state, formAction, isPending] = useActionState(action, initialState);
  const [status, setStatus] = useState<BlogStatus>(blog?.status ?? "DRAFT");
  const [content, setContent] = useState(blog?.content ?? "");
  const editorRef = useRef<MDXEditorMethods>(null);
  const statusOptions = canPublish
    ? STATUS_OPTIONS
    : STATUS_OPTIONS.filter((opt) => opt.value === "DRAFT");

  useEffect(() => {
    if (state.error) toast.error(state.error);
    if (state.success) toast.success("Blog saved");
  }, [state]);

  const selectedCategoryIds = new Set(blog?.categories.map((c) => c.id));
  const selectedTagIds = new Set(blog?.tags.map((t) => t.id));

  return (
    <form action={formAction} className="grid gap-6">
      <Tabs defaultValue="content">
        <TabsList>
          <TabsTrigger value="content">Content</TabsTrigger>
          <TabsTrigger value="settings">Settings</TabsTrigger>
          <TabsTrigger value="seo">SEO</TabsTrigger>
        </TabsList>

        <TabsContent value="content" className="grid gap-4">
          <div className="grid gap-2">
            <Label htmlFor="title">Title</Label>
            <Input id="title" name="title" defaultValue={blog?.title} required maxLength={255} />
          </div>
          <div className="grid gap-2">
            <Label htmlFor="slug">Slug</Label>
            <Input
              id="slug"
              name="slug"
              defaultValue={blog?.slug}
              placeholder="auto-generated if blank"
              maxLength={280}
            />
          </div>
          <div className="grid gap-2">
            <Label htmlFor="excerpt">Excerpt</Label>
            <Textarea id="excerpt" name="excerpt" defaultValue={blog?.excerpt ?? ""} rows={2} />
          </div>
          <div className="grid gap-2">
            <Label>Featured image</Label>
            <FeaturedImagePicker media={media} initial={blog?.featuredMedia ?? null} />
          </div>
          <div className="grid gap-2">
            <div className="flex items-center justify-between">
              <Label htmlFor="content">Content</Label>
              <InsertImageButton media={media} editorRef={editorRef} />
            </div>
            <input type="hidden" name="content" value={content} />
            <RichTextEditor
              ref={editorRef}
              markdown={content}
              onChange={setContent}
              placeholder="Write your post..."
            />
          </div>

          <div className="grid gap-2 sm:grid-cols-2">
            <div className="grid gap-2">
              <Label>Categories</Label>
              <div className="max-h-40 overflow-y-auto rounded-md border p-3">
                {categories.length === 0 && (
                  <p className="text-muted-foreground text-sm">No categories yet.</p>
                )}
                {categories.map((category) => (
                  <label
                    key={category.id}
                    className="flex items-center gap-2 py-1 text-sm"
                  >
                    <input
                      type="checkbox"
                      name="categoryIds"
                      value={category.id}
                      defaultChecked={selectedCategoryIds.has(category.id)}
                      className="accent-primary"
                    />
                    {category.name}
                  </label>
                ))}
              </div>
            </div>
            <div className="grid gap-2">
              <Label>Tags</Label>
              <div className="max-h-40 overflow-y-auto rounded-md border p-3">
                {tags.length === 0 && (
                  <p className="text-muted-foreground text-sm">No tags yet.</p>
                )}
                {tags.map((tag) => (
                  <label key={tag.id} className="flex items-center gap-2 py-1 text-sm">
                    <input
                      type="checkbox"
                      name="tagIds"
                      value={tag.id}
                      defaultChecked={selectedTagIds.has(tag.id)}
                      className="accent-primary"
                    />
                    {tag.name}
                  </label>
                ))}
              </div>
            </div>
          </div>
        </TabsContent>

        <TabsContent value="settings" className="grid gap-4">
          <div className="grid gap-2 sm:grid-cols-2">
            <div className="grid gap-2">
              <Label htmlFor="status">Status</Label>
              <Select
                name="status"
                value={status}
                onValueChange={(v) => setStatus(v as BlogStatus)}
                disabled={!canPublish}
              >
                <SelectTrigger id="status" className="w-full">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {statusOptions.map((opt) => (
                    <SelectItem key={opt.value} value={opt.value}>
                      {opt.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              {!canPublish && (
                <p className="text-muted-foreground text-xs">
                  Your role can only save drafts — publishing is done by an editor or admin.
                </p>
              )}
            </div>
            {status === "SCHEDULED" && (
              <div className="grid gap-2">
                <Label htmlFor="scheduledAt">Scheduled for</Label>
                <Input
                  id="scheduledAt"
                  name="scheduledAt"
                  type="datetime-local"
                  defaultValue={toDatetimeLocal(blog?.scheduledAt ?? null)}
                  required
                />
              </div>
            )}
          </div>

          <div className="flex items-center justify-between rounded-md border p-3">
            <div>
              <Label htmlFor="isFeatured">Featured</Label>
              <p className="text-muted-foreground text-sm">Highlight this post.</p>
            </div>
            <FeaturedSwitch defaultChecked={blog?.isFeatured ?? false} />
          </div>

          <div className="flex items-center justify-between rounded-md border p-3">
            <div>
              <Label htmlFor="allowComments">Allow comments</Label>
            </div>
            <AllowCommentsSwitch defaultChecked={blog?.allowComments ?? true} />
          </div>
        </TabsContent>

        <TabsContent value="seo" className="grid gap-4">
          <div className="grid gap-2">
            <Label htmlFor="seoTitle">SEO title</Label>
            <Input id="seoTitle" name="seoTitle" defaultValue={blog?.seoTitle ?? ""} maxLength={255} />
            <p className="text-muted-foreground text-xs">Defaults to the title if left blank.</p>
          </div>
          <div className="grid gap-2">
            <Label htmlFor="seoDescription">SEO description</Label>
            <Textarea
              id="seoDescription"
              name="seoDescription"
              defaultValue={blog?.seoDescription ?? ""}
              rows={2}
            />
            <p className="text-muted-foreground text-xs">
              Defaults to the excerpt/content if left blank.
            </p>
          </div>
          <div className="grid gap-2">
            <Label htmlFor="canonicalUrl">Canonical URL</Label>
            <Input id="canonicalUrl" name="canonicalUrl" defaultValue={blog?.canonicalUrl ?? ""} />
          </div>
        </TabsContent>
      </Tabs>

      <div className="flex justify-end">
        <Button type="submit" disabled={isPending}>
          {isPending ? "Saving..." : blog ? "Save changes" : "Create blog"}
        </Button>
      </div>
    </form>
  );
}

function FeaturedSwitch({ defaultChecked }: { defaultChecked: boolean }) {
  const [checked, setChecked] = useState(defaultChecked);
  return (
    <>
      <Switch id="isFeatured" checked={checked} onCheckedChange={setChecked} />
      <input type="hidden" name="isFeatured" value={checked ? "on" : "off"} />
    </>
  );
}

function AllowCommentsSwitch({ defaultChecked }: { defaultChecked: boolean }) {
  const [checked, setChecked] = useState(defaultChecked);
  return (
    <>
      <Switch id="allowComments" checked={checked} onCheckedChange={setChecked} />
      <input type="hidden" name="allowComments" value={checked ? "on" : "off"} />
    </>
  );
}
