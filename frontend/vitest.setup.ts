// Vitest global setup – runs once before all unit tests.
// Kept inside frontend/ so that Vite can resolve test-framework packages
// (e.g. @testing-library/jest-dom) from the correct node_modules directory.
// Test files themselves live in the root tests/unit/ directory.
import '@testing-library/jest-dom';
