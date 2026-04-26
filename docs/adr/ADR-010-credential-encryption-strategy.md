# ADR-010: AES-256-GCM Encryption for Destination Credentials

**Date:** 2026-04-26
**Status:** Accepted
**Deciders:** Arif Iqbal

## Context

FlowMesh stores credentials for every destination a user configures — PostgreSQL connection strings, AWS IAM access keys and secret keys, webhook signing secrets, and Slack OAuth tokens. These credentials grant write access to the user's production infrastructure. A breach of the FlowMesh database without encryption in place would expose every connected destination.

The Config service owns credential storage. The Go Delivery service reads and uses credentials at event delivery time. No other service touches them.

Three properties are required:

1. **Confidentiality at rest** — credentials in the database are unreadable without the master key
2. **Integrity** — tampered ciphertext must be detectable, not silently decrypted to garbage
3. **Per-record IV** — if two credentials happen to have the same plaintext, their ciphertexts must differ — otherwise an attacker can detect when two users store the same password

AES-256-CBC satisfies (1) but not (2) or (3) without additional MAC computation. AES-256-GCM satisfies all three natively — it is authenticated encryption, providing both confidentiality and integrity in one operation. It is the current industry standard for symmetric encryption of secrets at rest.

## Decision

All destination credentials are encrypted with AES-256-GCM before every database write.

**Encryption parameters:**
- Algorithm: AES-256-GCM
- Key length: 256 bits (32 bytes), provided via `ENCRYPTION_KEY` environment variable
- IV: 12 bytes, randomly generated per encryption operation using `crypto.randomBytes(12)`
- Auth tag: 16 bytes (GCM default), verified on every decryption
- Storage format: `iv_hex:authTag_hex:ciphertext_hex` — all three components stored together

**Key management:**
- The master encryption key lives in the `ENCRYPTION_KEY` environment variable — never in the database
- In production (FlowMesh Cloud): stored in AWS Secrets Manager — never in a `.env` file on the server
- For self-hosted: documented in `.env.example` with generation instructions (`openssl rand -hex 32`)
- Key rotation requires re-encrypting all stored credentials — plan tooling for this before the first production deployment

**Credential lifecycle:**
- Plaintext credential accepted at the API boundary (HTTPS only), encrypted immediately, stored as ciphertext
- Decryption happens only inside the Go Delivery service at event delivery time — never in Config service responses
- API responses and dashboard UI always return masked values: `postgresql://user:••••••••@host:5432/db`
- No retrieve endpoint — clients can update or delete a credential, never read back the plaintext
- Credentials are never written to logs at any level

## Consequences

### Positive
- Database breach does not expose user credentials — an attacker with a full Postgres dump cannot use the credentials without the master key
- GCM authentication tag catches any tampering — decryption fails loudly rather than returning corrupt plaintext
- Per-operation random IV means identical plaintexts produce different ciphertexts — no information leakage from pattern matching across rows
- Matches the security model of GitHub (PATs), Stripe (API keys), and other platforms users already trust

### Negative
- The master key is now a critical secret — losing it means all stored credentials are permanently unreadable. Backup and rotation procedures must exist before any production data is stored.
- There is no credential retrieval path — if a user loses access to their own credential (e.g., they rotated their AWS key externally), they must delete and re-add the destination in FlowMesh. This is intentional and must be clearly communicated in the dashboard UI.
- Key rotation is a batch operation, not zero-downtime — plan accordingly. Until a rotation tooling script exists, key rotation requires a maintenance window.
