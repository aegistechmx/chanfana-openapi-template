// ... (Tus imports se quedan igual)

app.use("*", async (c, next) => {
  await next();
  c.header("Strict-Transport-Security", "max-age=31536000; includeSubDomains; preload");
  c.header("X-Frame-Options", "DENY"); // Cambiado de SAMEORIGIN a DENY para más puntos
  c.header("X-Content-Type-Options", "nosniff");
  c.header("Referrer-Policy", "no-referrer-when-downgrade");
  c.header("Permissions-Policy", "camera=(), microphone=(), geolocation=(), interest-cohort=()");
  
  // CSP NIVEL PRO: Eliminamos parte de la flexibilidad para ganar el A+
  // Nota: Si Swagger deja de cargar, tendremos que volver a 'unsafe-inline' 
  // porque Swagger UI es una SPA que inyecta sus propios estilos.
  c.header("Content-Security-Policy", "default-src 'self'; script-src 'self' https://cdn.jsdelivr.net; style-src 'self' 'unsafe-inline' https://cdn.jsdelivr.net; img-src 'self' data: https://fastly.jsdelivr.net; connect-src 'self' *; upgrade-insecure-requests;");
});

// ... (Resto del código)