declare module 'qrcode/lib/core/qrcode' {
  export function create(text: string, opts?: { errorCorrectionLevel?: 'L' | 'M' | 'Q' | 'H' }): {
    modules: { size: number; get(x: number, y: number): number | boolean };
  };
}

declare module 'react-native-web' {
  export function unstable_createElement(type: string, props: Record<string, unknown>): import('react').ReactElement;
}
