# 2D Flight Radar

A 2D flight radar application built with React, TypeScript, MobX, Deck.gl, and SharedWorker.

The project displays aircraft on a radar-style map, allows selecting and editing aircraft details, shows active aircraft in the current viewport, and manages plane updates through a shared worker communication layer.

## Tech Stack

- React
- TypeScript
- MobX
- mobx-react-lite
- Deck.gl
- SharedWorker
- CSS

## Project Structure

```text
src/
├── components/        # React UI components
├── constants/         # Reusable configuration values
├── data/              # Mock plane data
├── domain/            # Plane types and plane-related domain logic
├── map/               # Deck.gl rendering logic
├── services/          # Data services and worker client
├── stores/            # MobX stores and store instances
├── utils/             # General reusable utility functions
└── workers/           # SharedWorker logic and worker message types
```

## Instructions for Running the Project

### 1. Clone the repository

```bash
git clone <repository-url>
```

### 2. Navigate into the project folder

```bash
cd flight-radar
```

### 3. Install dependencies

```bash
npm install
```

### 4. Run the development server

```bash
npm run dev
```

### 5. Open the app in the browser

After running the project, open the local URL shown in the terminal.

Usually it will be:

```text
http://localhost:5173
```

## Build for Production

To create a production-ready build:

```bash
npm run build
```
