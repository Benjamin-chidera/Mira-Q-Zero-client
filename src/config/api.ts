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

export const API_BASE_URL = (import.meta.env.VITE_API_BASE_URL || getFallbackApiUrl()).replace(/\/$/, "");
