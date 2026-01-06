app.use("*", async (c, next) => {
  await next();
  
  // Cabeceras de máxima seguridad
  c.header("Strict-Transport-Security", "max-age=31536000; includeSubDomains; preload");
  c.header("X-Frame-Options", "SAMEORIGIN");
  c.header("X-Content-Type-Options", "nosniff");
  c.header("Referrer-Policy", "strict-origin-when-cross-origin");
  c.header("Permissions-Policy", "camera=(), microphone=(), geolocation=()");

  /**
   * CSP NIVEL A+:
   * 1. Eliminamos 'unsafe-inline' de script-src (Swagger UI lo echará de menos, pero el A+ volverá).
   * 2. Si Swagger deja de cargar, usaremos la opción de 'hashes' o 'nonces' en el siguiente paso.
   */
  c.header(
    "Content-Security-Policy",
    "default-src 'self'; " +
    "script-src 'self' https://cdn.jsdelivr.net; " + // Quitamos 'unsafe-inline'
    "style-src 'self' 'unsafe-inline' https://cdn.jsdelivr.net; " + // Styles suele permitirse más fácil
    "img-src 'self' data: https://aegistechmx.github.io https://raw.githubusercontent.com; " +
    "font-src 'self' https://cdn.jsdelivr.net; " +
    "connect-src 'self';"
  );
});