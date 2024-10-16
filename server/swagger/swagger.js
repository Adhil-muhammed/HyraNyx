import swaggerJsdoc from "swagger-jsdoc";
import swaggerUi from "swagger-ui-express";

const swaggerDefinition = {
  openapi: "3.0.0", // Version of OpenAPI
  info: {
    title: "My API Documentation", // API Title
    version: "1.0.0", // API Version
    description: "API Documentation for My Project", // Description
  },
  servers: [
    {
      url: "http://localhost:5000", // Development server URL
    },
  ],
};

// Swagger options
const options = {
  swaggerDefinition,
  apis: ["./routes/*.js"], // Paths to your route files
};

// Initialize swagger-jsdoc
const swaggerSpec = swaggerJsdoc(options);

export const setupSwagger = (app) => {
  app.use("/api-docs", swaggerUi.serve, swaggerUi.setup(swaggerSpec));
};
