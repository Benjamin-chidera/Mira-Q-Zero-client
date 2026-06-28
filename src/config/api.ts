const getFallbackApiUrl = (): string => {
  const hostname = window.location.hostname;
  
  // Local development environments
  if (
    hostname === "localhost" ||
    hostname === "127.0.0.1" ||
    hostname.startsWith("192.168.") ||
    hostname.startsWith("10.") ||
    hostname.endsWith(".local")
  ) {
    return `http://${hostname}:8000`;
  }
  
  // Production deployment on discoverbenix.com
  if (hostname.endsWith("discoverbenix.com")) {
    return "https://gp-connect.api.discoverbenix.com";
  }
  
  // Dynamic fallback for any other production domains
  const protocol = window.location.protocol; // "http:" or "https:"
  return `${protocol}//gp-connect.api.${hostname.replace(/^gp-connect\./, "")}`;
};

export const API_BASE_URL = (() => {
  let baseUrl = (import.meta.env.VITE_API_BASE_URL || getFallbackApiUrl()).replace(/\/$/, "");
  
  // Force HTTPS if the current page is loaded over HTTPS to prevent Mixed Content errors
  if (typeof window !== "undefined" && window.location.protocol === "https:" && baseUrl.startsWith("http://") && !baseUrl.includes("localhost") && !baseUrl.includes("127.0.0.1")) {
    baseUrl = baseUrl.replace(/^http:/, "https:");
  }
  
  return baseUrl;
})();
