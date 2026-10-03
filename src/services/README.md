# Future integrations

Voice, AI, OCR and cloud synchronization are deliberately not implemented in v1.
Future adapters belong in voice/, ai/, ocr/ and sync/. They should return proposed
products to the application layer; only repositories may persist changes.
Network services must be optional and never block local shopping workflows.
No credentials, permissions or network requests are required by the shopping app.
