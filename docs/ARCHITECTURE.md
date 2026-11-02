# Initial Architecture

## Style
A modular monolith. This reduces operational complexity and memory use on a 4 GB CPU-only laptop.

## Modules
- Citizen reporting: structured report, coordinates and optional image.
- Evidence handling: basic file-signature validation and SHA-256 hashing.
- Persistence: SQLite during local development.
- Geospatial display: Leaflet consumes report coordinates.
- Analytics: counts by category and status.

## Trust boundaries
1. Browser to API: local HTTP during development.
2. API to database: local SQLite file.
3. API to evidence storage: local private upload directory.
4. Browser to tile provider: external map tile requests.

## Limitations
- Coordinates are numeric latitude/longitude, not PostGIS geometry yet.
- Authentication and authorization are not implemented.
- No AI model is implemented in this initial scaffold.
- Hashes establish file integrity after upload, not source authenticity.
- Map tiles require internet.
- Summary data is limited to this local database.

## Next increments
1. Add authentication and reviewer/admin roles.
2. Add an auditable status-transition endpoint.
3. Migrate to PostgreSQL/PostGIS after the local workflow stabilizes.
4. Add spatial clustering as a separately tested Python module.
5. Add computer vision only after collecting a suitable labelled dataset.
