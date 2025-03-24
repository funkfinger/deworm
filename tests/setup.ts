import "@testing-library/jest-dom";
import { vi, afterEach } from "vitest";

// Mock next/navigation
vi.mock("next/navigation", () => ({
  useRouter: vi.fn(() => ({
    push: vi.fn(),
    replace: vi.fn(),
    prefetch: vi.fn(),
    back: vi.fn(),
    forward: vi.fn(),
  })),
  usePathname: vi.fn(() => "/"),
  useSearchParams: vi.fn(() => ({
    get: vi.fn(),
    has: vi.fn(),
    getAll: vi.fn(),
    forEach: vi.fn(),
    entries: vi.fn(),
    keys: vi.fn(),
    values: vi.fn(),
    toString: vi.fn(),
  })),
}));

// Mock next/image
vi.mock("next/image", () => ({
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  default: vi.fn(({ src, alt, ...props }: any) => {
    return {
      type: "img",
      props: {
        src,
        alt,
        ...props,
      },
    };
  }),
}));

// Mock FontAwesome
vi.mock("@fortawesome/react-fontawesome", () => ({
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  FontAwesomeIcon: vi.fn(({ icon, ...props }: any) => {
    return {
      type: "span",
      props: {
        "data-icon": icon?.iconName || icon,
        ...props,
      },
    };
  }),
}));

// Mock global fetch
global.fetch = vi.fn();

// Clean up after each test
afterEach(() => {
  vi.clearAllMocks();
});
