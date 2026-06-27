import { Fragment } from "react";
import type { ReactNode } from "react";

/**
 * Parses inline markdown styling: bold (**text**), markdown links ([text](url)),
 * angle-bracketed URLs (<url>), and naked URLs.
 */
export function parseInlineStyling(text: string): ReactNode[] {
  // Split by bold (**bold**), markdown links ([text](url)), or bracketed URLs (<url>)
  const regex = /(\*\*.*?\*\*|\[.*?\]\(.*?\)|<https?:\/\/.*?>)/g;
  const parts = text.split(regex);

  return parts.map((part, index) => {
    // Bold text
    if (part.startsWith("**") && part.endsWith("**")) {
      const boldText = part.slice(2, -2);
      return (
        <strong key={index} className="font-bold text-gray-950">
          {boldText}
        </strong>
      );
    }

    // Markdown links: [anchor](url)
    if (part.startsWith("[") && part.includes("](")) {
      const closingBracketIndex = part.indexOf("]");
      const anchorText = part.slice(1, closingBracketIndex);
      const url = part.slice(closingBracketIndex + 2, -1);
      return (
        <a
          key={index}
          href={url}
          target="_blank"
          rel="noopener noreferrer"
          className="text-[#005EB8] hover:underline font-bold inline-flex items-center gap-0.5 cursor-pointer"
        >
          {anchorText}
        </a>
      );
    }

    // Angle-bracketed URLs: <https://...>
    if (part.startsWith("<") && part.endsWith(">")) {
      const url = part.slice(1, -1);
      return (
        <a
          key={index}
          href={url}
          target="_blank"
          rel="noopener noreferrer"
          className="text-[#005EB8] hover:underline font-bold inline-flex items-center gap-0.5 cursor-pointer"
        >
          {url}
        </a>
      );
    }

    // Check for naked URLs embedded in the text
    const urlRegex = /(https?:\/\/[^\s)]+)/g;
    if (urlRegex.test(part)) {
      const subparts = part.split(urlRegex);
      return (
        <span key={index}>
          {subparts.map((subpart, subIndex) => {
            if (
              subpart.startsWith("http://") ||
              subpart.startsWith("https://")
            ) {
              let cleanUrl = subpart;
              let trailing = "";
              if (cleanUrl.endsWith(".") || cleanUrl.endsWith(",")) {
                trailing = cleanUrl.slice(-1);
                cleanUrl = cleanUrl.slice(0, -1);
              }
              return (
                <Fragment key={subIndex}>
                  <a
                    href={cleanUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-[#005EB8] hover:underline font-bold inline-flex items-center gap-0.5 cursor-pointer"
                  >
                    {cleanUrl}
                  </a>
                  {trailing}
                </Fragment>
              );
            }
            return <span key={subIndex}>{subpart}</span>;
          })}
        </span>
      );
    }

    return <span key={index}>{part}</span>;
  });
}

/**
 * Renders markdown content as React elements.
 * Handles headings (# to ######), bullet lists (* or -),
 * horizontal rules (--- or ===), and inline styling.
 */
export function renderMarkdownContent(content: string) {
  const lines = content.split("\n");

  return lines.map((line, lineIndex) => {
    // Horizontal rules or header underlines
    if (/^[=-]{3,}$/.test(line.trim())) {
      return <hr key={lineIndex} className="my-3 border-gray-200" />;
    }

    // Headings (e.g. #, ##, ###)
    const headingMatch = line.match(/^(#{1,6})\s+(.*)$/);
    if (headingMatch) {
      const level = headingMatch[1].length;
      const text = headingMatch[2];
      const parsedText = parseInlineStyling(text);

      const headerClasses =
        level === 1
          ? "text-[1.125rem] font-bold text-gray-900 mt-4 mb-2"
          : level === 2
            ? "text-[1rem] font-bold text-gray-900 mt-3 mb-1.5"
            : "text-[0.875rem] font-bold text-gray-800 mt-2.5 mb-1";

      return (
        <div key={lineIndex} className={headerClasses}>
          {parsedText}
        </div>
      );
    }

    // Numbered lists (e.g. "1. Item")
    const numberedMatch = line.match(/^(\d+)\.\s+(.*)$/);
    if (numberedMatch) {
      const number = numberedMatch[1];
      const text = numberedMatch[2];
      return (
        <div
          key={lineIndex}
          className="flex gap-2 pl-4 py-0.5 text-[0.8125rem] leading-relaxed text-gray-800"
        >
          <span className="text-[#005EB8] shrink-0 select-none text-xs font-bold min-w-[1rem]">
            {number}.
          </span>
          <span className="flex-1">{parseInlineStyling(text)}</span>
        </div>
      );
    }

    // Bullet lists (e.g. * or -)
    const bulletMatch = line.match(/^(\*|-)\s+(.*)$/);
    if (bulletMatch) {
      const text = bulletMatch[2];
      return (
        <div
          key={lineIndex}
          className="flex gap-2 pl-4 py-0.5 text-[0.8125rem] leading-relaxed text-gray-800"
        >
          <span className="text-[#005EB8] shrink-0 mt-1.5 select-none text-xs">
            •
          </span>
          <span className="flex-1">{parseInlineStyling(text)}</span>
        </div>
      );
    }

    // Empty lines as spacing
    if (line.trim() === "") {
      return <div key={lineIndex} className="h-2" />;
    }

    // Normal paragraph text
    return (
      <div
        key={lineIndex}
        className="text-gray-800 text-[0.8125rem] leading-relaxed my-0.5"
      >
        {parseInlineStyling(line)}
      </div>
    );
  });
}
