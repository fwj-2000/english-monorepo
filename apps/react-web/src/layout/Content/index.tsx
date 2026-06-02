import { Layout } from "antd"

const { Content: AntContent } = Layout

export default function AppContent({ children }: { children: React.ReactNode }) {
  return (
    <AntContent className="p-6 bg-gray-50">
      {children}
    </AntContent>
  )
}
