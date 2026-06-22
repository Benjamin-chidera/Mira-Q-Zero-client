import { describe, it, expect } from "vitest";
import { formatMarkdownToHtml } from "./pdfFormatter";

describe("formatMarkdownToHtml", () => {
  it("escapes special HTML characters", () => {
    const input = "Condition A < Condition B & Condition C";
    const result = formatMarkdownToHtml(input);
    expect(result).toContain("Condition A &lt; Condition B &amp; Condition C");
  });

  it("formats markdown headers correctly", () => {
    const input = "# Main Title\n## Section Title\n### Sub Section";
    const result = formatMarkdownToHtml(input);
    expect(result).toContain('<h1 style="font-family: Arial, sans-serif; color: #004A99; margin-top: 0; margin-bottom: 12px; font-size: 20px; font-weight: bold; border-bottom: 2px solid #005EB8; padding-bottom: 8px;">Main Title</h1>');
    expect(result).toContain('<h2 style="font-family: Arial, sans-serif; color: #111827; margin-top: 24px; margin-bottom: 10px; font-size: 16px; font-weight: bold; border-bottom: 1px solid #E5E7EB; padding-bottom: 6px;">Section Title</h2>');
    expect(result).toContain('<h3 style="font-family: Arial, sans-serif; color: #111827; margin-top: 18px; margin-bottom: 8px; font-size: 14px; font-weight: bold;">Sub Section</h3>');
  });

  it("formats lists and groups consecutive list items under a ul block", () => {
    const input = "- Item 1\n- Item 2\n\nSome text\n* Item 3";
    const result = formatMarkdownToHtml(input);
    expect(result).toContain('<ul style="padding-left: 20px; margin-top: 8px; margin-bottom: 8px;">');
    expect(result).toContain('<li style="font-family: Arial, sans-serif; color: #374151; font-size: 13px; line-height: 1.6; margin-bottom: 6px;">Item 1</li>');
    expect(result).toContain('<li style="font-family: Arial, sans-serif; color: #374151; font-size: 13px; line-height: 1.6; margin-bottom: 6px;">Item 2</li>');
    expect(result).toContain('<p style="margin: 8px 0; font-family: Arial, sans-serif; color: #374151; font-size: 13px; line-height: 1.6;">Some text</p>');
    expect(result).toContain('<li style="font-family: Arial, sans-serif; color: #374151; font-size: 13px; line-height: 1.6; margin-bottom: 6px;">Item 3</li>');
  });

  it("handles bold, italics, and markdown links", () => {
    const input = "This is **bold** and *italic* and a [link](https://nhs.uk).";
    const result = formatMarkdownToHtml(input);
    expect(result).toContain('<strong style="color: #111827; font-weight: bold;">bold</strong>');
    expect(result).toContain('<em style="color: #374151; font-style: italic;">italic</em>');
    expect(result).toContain('<a href="https://nhs.uk" style="color: #005EB8; text-decoration: underline; font-weight: bold;" target="_blank">link</a>');
  });

  it("adds spacer divs for empty lines and paragraph tags for generic lines", () => {
    const input = "Line 1\n\nLine 2";
    const result = formatMarkdownToHtml(input);
    expect(result).toContain('<p style="margin: 8px 0; font-family: Arial, sans-serif; color: #374151; font-size: 13px; line-height: 1.6;">Line 1</p>');
    expect(result).toContain('<div style="height: 10px;"></div>');
    expect(result).toContain('<p style="margin: 8px 0; font-family: Arial, sans-serif; color: #374151; font-size: 13px; line-height: 1.6;">Line 2</p>');
  });
});
