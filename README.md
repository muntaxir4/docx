# DocX - Document Extraction using OCR and AI

## Backend

The backend is implemented using Node.js with TypeScript. It includes core functionalities such as document data extraction using Tesseract.js and basic validation.

### Dependencies

- `express`: Web framework for Node.js.
- `tesseract.js`: Library for OCR (Optical Character Recognition).
- `@huggingface/inference`: Library for using Hugging Face's inference API.
- `multer`: Middleware for handling `multipart/form-data`.

## Frontend

The frontend is built using React with TypeScript and Vite for fast development and build processes. Tailwind CSS is used for styling.

### Dependencies

- `react`: JavaScript library for building user interfaces.
- `vite`: Next-generation frontend tooling.
- `tailwindcss`: Utility-first CSS framework.

## Getting Started

### Backend

1. Navigate to the `server` directory:
   ```sh
   cd server
   ```
2. Install the dependencies:
   ```sh
   npm install
   ```
3. Start the development server:
   ```sh
   npm run dev
   ```

The server will run at `http://localhost:3000`.

### Frontend

1. Navigate to the `web` directory:
   ```sh
   cd web
   ```
2. Install the dependencies:
   ```sh
   npm install
   ```
3. Start the development server:
   ```sh
   npm run dev
   ```

The server will run at `http://localhost:5173`.
