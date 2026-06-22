/**
 * Helper utility to parse markdown syntax into inline-styled HTML blocks
 * for GP-Connect's NHS-branded PDF/Print document generation.
 */
export function formatMarkdownToHtml(content: string): string {
  // Simple clean HTML escaping
  let htmlContent = content
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;");

  // Format headers
  htmlContent = htmlContent
    .replace(/^### (.*$)/gim, '<h3 style="font-family: Arial, sans-serif; color: #111827; margin-top: 18px; margin-bottom: 8px; font-size: 14px; font-weight: bold;">$1</h3>')
    .replace(/^## (.*$)/gim, '<h2 style="font-family: Arial, sans-serif; color: #111827; margin-top: 24px; margin-bottom: 10px; font-size: 16px; font-weight: bold; border-bottom: 1px solid #E5E7EB; padding-bottom: 6px;">$1</h2>')
    .replace(/^# (.*$)/gim, '<h1 style="font-family: Arial, sans-serif; color: #004A99; margin-top: 0; margin-bottom: 12px; font-size: 20px; font-weight: bold; border-bottom: 2px solid #005EB8; padding-bottom: 8px;">$1</h1>');

  // Format lists
  htmlContent = htmlContent.replace(/^\s*[-*]\s+(.*$)/gim, '<li style="font-family: Arial, sans-serif; color: #374151; font-size: 13px; line-height: 1.6; margin-bottom: 6px;">$1</li>');
  htmlContent = htmlContent.replace(/^\s*\d+\.\s+(.*$)/gim, '<li style="font-family: Arial, sans-serif; color: #374151; font-size: 13px; line-height: 1.6; margin-bottom: 6px;">$1</li>');

  // Bold / Italic / Links
  htmlContent = htmlContent.replace(/\*\*(.*?)\*\*/g, '<strong style="color: #111827; font-weight: bold;">$1</strong>');
  htmlContent = htmlContent.replace(/\*(.*?)\*/g, '<em style="color: #374151; font-style: italic;">$1</em>');
  htmlContent = htmlContent.replace(/\[(.*?)\]\((.*?)\)/g, '<a href="$2" style="color: #005EB8; text-decoration: underline; font-weight: bold;" target="_blank">$1</a>');

  // Lines loop to handle wrapping list items in <ul> blocks
  const lines = htmlContent.split("\n");
  let finalHtml = "";
  let inList = false;

  for (const line of lines) {
    const trimmed = line.trim();
    if (trimmed.startsWith("<li")) {
      if (!inList) {
        finalHtml += '<ul style="padding-left: 20px; margin-top: 8px; margin-bottom: 8px;">';
        inList = true;
      }
      finalHtml += line;
    } else {
      if (inList) {
        finalHtml += "</ul>";
        inList = false;
      }
      if (trimmed === "") {
        finalHtml += '<div style="height: 10px;"></div>';
      } else if (
        !trimmed.startsWith("<h") &&
        !trimmed.startsWith("<ul") &&
        !trimmed.startsWith("<ol")
      ) {
        finalHtml += `<p style="margin: 8px 0; font-family: Arial, sans-serif; color: #374151; font-size: 13px; line-height: 1.6;">${line}</p>`;
      } else {
        finalHtml += line;
      }
    }
  }
  if (inList) {
    finalHtml += "</ul>";
  }

  return finalHtml;
}
