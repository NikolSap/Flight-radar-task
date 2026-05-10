# Architecture Notes

A lightweight 2D Flight Radar application built as a SPA using React, TypeScript, MobX, Deck.gl, and SharedWorker.

The app displays aircraft on an interactive radar map, supports zoom and pan, allows editing plane names, renders only aircraft currently visible in the viewport, and uses SharedWorker to keep plane data synchronized across multiple browser tabs.

## High-Level Architecture

The project is separated into clear layers:

- React components handle the UI
- MobX store manages application state and business logic
- DeckRadar handles map rendering with Deck.gl
- Services handle data access and worker communication
- SharedWorker manages shared plane data in the background
- Domain files define plane-related types and logic
- Utils contain reusable helper functions
- Constants contain reusable configuration values

## Application Data Flow

The application has two main data flows: the initial data flow and the SharedWorker update flow.

### Initial Data Flow

When the app starts, the initial plane data is loaded from the mock data service and passed into the MobX store.

```text
Initial Mock Data
        ↓
PlaneStore
        ↓
RadarView
        ↓
DeckRadar
        ↓
Deck.gl Canvas
```

`PlaneStore` stores the plane data and manages the application state

`RadarView` connects the MobX store to the rendering layer

`DeckRadar` receives the visible planes and renders them on the Deck.gl canvas

### SharedWorker Update Flow

After the store is connected to the worker client, plane updates are synchronized through the SharedWorker.

```text
SharedWorker
        ↓
PlaneWorkerClient
        ↓
PlaneStore
        ↓
RadarView
        ↓
DeckRadar
        ↓
Deck.gl Canvas
```

`PlaneWorkerClient` acts as a communication layer between the SharedWorker and the application.

When the SharedWorker sends updated plane data, `PlaneWorkerClient` receives it and notifies the store.

The updated plane data is stored in `PlaneStore`, and the radar is updated through `RadarView` and `DeckRadar`.

## Relationship Between Main Classes

### `PlaneStore`

`PlaneStore` manages the main application state and business logic.

It stores:

- All planes
- Selected plane
- Viewport bounds
- Visible planes
- Plane name updates

It also connects to `PlaneWorkerClient` to receive updates from the SharedWorker.

### `PlaneWorkerClient`

`PlaneWorkerClient` manages communication with the SharedWorker.

It sends messages to the worker, receives updated plane state, and notifies registered listeners.

### `DeckRadar`

`DeckRadar` manages rendering logic.

It creates the Deck.gl instance, renders plane markers and labels, handles plane clicks, calculates viewport bounds, resizes the canvas, and cleans up Deck.gl resources.

### `RadarView`

`RadarView` connects the UI, store, and rendering layer.

It creates the `DeckRadar` instance, listens to MobX state changes, updates the rendered planes, and displays the floating panels for the selected plane and active aircraft.

## Folder Structure and Responsibilities

### `components/`

Contains the React UI components.

#### `RadarView.tsx`

Main screen component.

Responsibilities:

- Initializes the radar view
- Creates the `DeckRadar` instance
- Connects the canvas element to Deck.gl
- Handles plane click events
- Displays the floating edit panel for the selected plane
- Displays the active aircraft panel with all visible planes
- Syncs visible planes from the MobX store to the radar
- Handles radar resizing and panel positioning

#### `PlaneEditPanel.tsx`

Floating panel for viewing and editing the selected plane details.

Responsibilities:

- Displays selected plane details
- Allows editing the selected plane name
- Validates that the plane name is not empty
- Saves name updates through the MobX store
- Updates are synchronized with the radar and across browser tabs through the SharedWorker

#### `ActiveAircraftPanel.tsx`

Panel for managing all aircraft currently visible in the viewport

Responsibilities:

- Displays all currently visible aircraft
- Allows editing multiple plane names
- Validates empty plane names
- Saves name updates through the MobX store
- Updates are synchronized with the radar and across browser tabs through the SharedWorker

### `stores/`

Contains MobX state management.

#### `PlaneStore.ts`

Main MobX store.

Responsibilities:

- Stores all planes
- Stores the selected plane id
- Stores viewport bounds
- Calculates `visiblePlanes`
- Updates plane names
- Connects to the worker client

#### `planeStoreInstance.ts`

Creates one shared `PlaneStore` instance.

Purpose:

- Keeps application state centralized
- Prevents creating multiple store instances
- Connects the store to the shared worker client

### `services/`

Contains data and communication services.

#### `PlaneWorkerClient.ts`

Client class for communicating with the SharedWorker.

Responsibilities:

- Creates the SharedWorker
- Starts the worker port
- Sends messages to the worker
- Receives plane state updates
- Notifies registered listeners

For example, when a plane name changes, the client sends a message to the worker so the updated state can be synchronized with all connected tabs.

#### `planeWorkerClientInstance.ts`

Creates one shared `PlaneWorkerClient` instance.

Purpose:

- Keeps worker communication centralized.
- Prevents creating multiple worker clients across the app.

#### `planeDataService.ts`

Provides the initial mock plane data

Purpose:

- Keeps the store independent from the mock data file
- Makes it easier to replace mock data with an API later

### `workers/`

Contains the SharedWorker logic and message types

#### `planeSharedWorker.ts`

SharedWorker file that manages plane data in the background

Responsibilities:

- Holds shared plane state
- Responds to plane requests
- Updates plane names
- Sends updated plane state to connected clients

#### `planeWorker.types.ts`

Defines TypeScript types for worker messages

Purpose:

- Improves type safety.
- Makes worker communication clearer and safer

### `map/`

Contains Deck.gl rendering logic

#### `DeckRadar.ts`

Encapsulates Deck.gl rendering logic

Responsibilities:

- Creates the Deck.gl instance
- Renders aircraft markers
- Renders aircraft labels
- Handles click events on planes
- Calculates viewport bounds
- Handles resize
- Cleans up Deck.gl resources

### `domain/`

Contains plane-related types and domain utilities

#### `plane.types.ts`

Defines the `Plane` type

#### `viewport.types.ts`

Defines viewport bounds

#### `plane.utils.ts`

Contains plane-related domain utilities

Examples:

- `getPlaneColor`
- `getPlaneLabel`

These functions are placed in `domain` because they are related to plane logic, not general utilities.

### `utils/`

Contains general reusable utility functions

#### `calculateFloatingPanelPosition.ts`

Calculates where floating panels should appear after clicking a plane.

Purpose:

- Keeps panel positioning logic outside React components
- Prevents panels from overflowing outside the radar container

### `constants/`

Contains reusable configuration values

Purpose:

- Avoids hardcoded values inside components
- Makes the project easier to maintain

## Performance Optimizations Implemented

### Viewport-Based Filtering

The app calculates the current visible map bounds and stores them in `PlaneStore`.

`PlaneStore` then calculates `visiblePlanes`, so only aircraft inside the current viewport are rendered.

This avoids rendering off-screen aircraft and improves performance as the number of planes grows.

### Deck.gl Rendering Isolation

Deck.gl rendering is isolated inside `DeckRadar`.

React components do not directly manage Deck.gl layers. This keeps rendering updates controlled and separates rendering logic from business logic.

### MobX Reaction

`RadarView` uses MobX `reaction` to update the radar only when relevant visible plane fields change.

The tracked fields include:

- Plane id
- Plane name
- Country
- Latitude
- Longitude

This avoids unnecessary rendering updates when unrelated state changes.

### Reaction Delay

A small reaction delay is used to reduce frequent layer updates.

This helps when plane data changes quickly.

### ResizeObserver

`ResizeObserver` is used to update the Deck.gl canvas size only when the radar container changes.

### SharedWorker

SharedWorker keeps plane data management and synchronization separated from the UI thread and allows multiple browser tabs to share the same plane state.

## Scalability Considerations

### Replace Mock Data With API

The project currently uses mock aircraft data, but the data source is wrapped in `planeDataService`.

This makes it easier to replace the mock data with an API later without changing the store structure.

### Extend Worker Messages

Worker communication is centralized in `PlaneWorkerClient` and typed in `planeWorker.types.ts`.

This makes it easier to add more message types later, such as:

- Add plane
- Delete plane
- Update plane location
- Stream live plane updates

### Larger Datasets

The project currently supports viewport-based filtering through `visiblePlanes`, so only aircraft inside the current map viewport are rendered.

For larger datasets, this can be extended into advanced viewport-based loading, where the app requests only aircraft inside the visible map area from an API instead of loading all aircraft into the client.

### Multiple Browser Tabs

Because the project uses SharedWorker, multiple browser tabs can share the same plane data source and receive synchronized updates.

Overall, the separation between state management, rendering logic, services, and worker communication makes the project easier to extend as the amount of aircraft data grows.
