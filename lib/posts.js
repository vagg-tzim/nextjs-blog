import fs from "fs";
import path from "path";
import matter from "gray-matter";
import { remark } from "remark";
import html from "remark-html";

const postsDirectory = path.join(process.cwd(), "posts");

function _remove_md_file_extention_from_string(filename) {
  const striped_filename = filename.replace(/\.md$/, "");
  return striped_filename;
}

export function getSortedPostsData() {
  const filenames = fs.readdirSync(postsDirectory);
  const allPostsData = filenames.map((fileName) => {
    // Remove ".md" from file name to get id
    const id = _remove_md_file_extention_from_string(fileName);

    // Read markdown file as string
    const fullPath = path.join(postsDirectory, fileName);
    const fileContents = fs.readFileSync(fullPath, "utf8");

    // Use gray-matter to parse the post metadata section
    const matterResult = matter(fileContents);

    // Combine the data with the id
    return {
      id,
      ...matterResult.data,
    };
  });

  return allPostsData;
}

export function getAllPostIds() {
  const filenames = fs.readdirSync(postsDirectory);
  const postIds = filenames.map((filename) => {
    return {
      params: {
        id: _remove_md_file_extention_from_string(filename),
      },
    };
  });
  return postIds;
}

export async function getPostData(id) {
  const fullPath = path.join(postsDirectory, `${id}.md`);
  const fileContents = fs.readFileSync(fullPath, "utf-8");

  const matterResult = matter(fileContents);
  const processedContent = await remark()
    .use(html)
    .process(matterResult.content);
  const contentHtml = processedContent.toString();
  return {
    id,
    contentHtml,
    ...matterResult.data,
  };
}
