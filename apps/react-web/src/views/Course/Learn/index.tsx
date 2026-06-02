import { useParams } from "react-router"

export default function Learn() {
  const { courseId, title } = useParams()
  return <div>学习页面 —— {title} ({courseId})</div>
}
