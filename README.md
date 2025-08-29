# DCH-API

The `dch-api` is the backend service for the Digital Cultural Heritage (DCH) monorepo. It provides a RESTful API for the `voice-curated-archive` frontend.

## Key Technologies

-   **Runtime:** Node.js
-   **Framework:** Express.js
-   **Language:** TypeScript
-   **Package Manager:** Bun
-   **Database:** MongoDB (via Mongoose)

## Getting Started

### Prerequisites

-   [Bun](https://bun.sh/)
-   [Node.js](https://nodejs.org/)
-   A running MongoDB instance.

### Installation

1.  Navigate to the `dch-api` directory:
    ```bash
    cd dch-api
    ```
2.  Install the dependencies:
    ```bash
    bun install
    ```
3.  Create a `.env` file in the root of the `dch-api` directory and add the necessary environment variables (e.g., database connection string, port).
    ```
    PORT=3000
    MONGO_URI=mongodb://localhost:27017/dch
    ```

### Running the Development Server

To start the development server, run the following command:

```bash
bun run dev
```

The API will be available at `http://localhost:3000` (or the port specified in your `.env` file).