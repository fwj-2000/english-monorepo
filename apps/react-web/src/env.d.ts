/// <reference types="vite/client" />
declare module 'marked' {
  export function marked(src: string): string | Promise<string>
  export default marked
}
