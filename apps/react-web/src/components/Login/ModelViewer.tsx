import { useRef, useEffect } from "react"
import * as THREE from "three"
import { GLTFLoader } from "three/examples/jsm/loaders/GLTFLoader.js"
import { OrbitControls } from "three/examples/jsm/controls/OrbitControls.js"

interface Props {
  modelType?: "login" | "register"
  onChangeType?: (type: "login" | "register") => void
}

export default function ModelViewer({ modelType = "login", onChangeType }: Props) {
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const sceneRef = useRef<THREE.Scene | null>(null)
  const mixerRef = useRef<THREE.AnimationMixer | null>(null)
  const modelRef = useRef<THREE.Group | null>(null)

  const loadModel = (type: string) => {
    const scene = sceneRef.current
    if (!scene) return
    if (modelRef.current) {
      scene.remove(modelRef.current)
      modelRef.current = null
    }
    const loader = new GLTFLoader()
    const path = type === "login" ? "/models/login/scene.gltf" : "/models/register/scene.gltf"
    loader.load(path, (gltf) => {
      modelRef.current = gltf.scene
      modelRef.current.scale.set(0.8, 0.8, 0.8)
      scene.add(modelRef.current)
      scene.position.y = -0.8
      if (gltf.animations && gltf.animations.length > 0) {
        mixerRef.current = new THREE.AnimationMixer(modelRef.current)
        gltf.animations.forEach((anim) => {
          mixerRef.current!.clipAction(anim).play()
        })
      }
    })
  }

  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return
    const width = canvas.clientWidth
    const height = canvas.clientHeight
    const scene = new THREE.Scene()
    sceneRef.current = scene

    const camera = new THREE.PerspectiveCamera(60, width / height, 0.1, 1000)
    camera.position.set(1, 0.5, 1)

    const renderer = new THREE.WebGLRenderer({
      canvas,
      antialias: true,
      alpha: true,
      precision: "highp",
      powerPreference: "high-performance",
    })
    renderer.setSize(width, height)

    loadModel(modelType)
    const controls = new OrbitControls(camera, renderer.domElement)
    const clock = new THREE.Clock()

    let animId: number
    const animate = () => {
      animId = requestAnimationFrame(animate)
      const delta = clock.getDelta()
      if (mixerRef.current) mixerRef.current.update(delta)
      scene.rotation.y += 0.002
      controls.update()
      renderer.render(scene, camera)
    }
    animate()

    return () => {
      cancelAnimationFrame(animId)
      renderer.dispose()
      controls.dispose()
      if (modelRef.current) {
        scene.remove(modelRef.current)
      }
    }
  }, [])

  const loginActive = modelType === "login"
  const registerActive = modelType === "register"

  return (
    <div className="relative w-[460px] h-full bg-blue-600">
      <canvas ref={canvasRef} className="w-full h-full" />
      <div className="absolute top-6 left-6">
        <div className="flex items-center gap-2">
          <div className="w-10 h-10 bg-white rounded-lg flex items-center justify-center">
            <span className="text-blue-600 font-bold text-xl">E</span>
          </div>
          <span className="text-white text-lg font-semibold">English App</span>
        </div>
      </div>
      <div className="absolute top-6 right-6">
        <div className="flex items-center gap-1 bg-white/15 rounded-lg p-1">
          <button
            onClick={() => { loadModel("login"); onChangeType?.("login") }}
            className={
              loginActive
                ? "bg-white text-blue-700 px-4 py-2 rounded-md text-sm font-medium"
                : "text-white/70 hover:text-white hover:bg-white/10 px-4 py-2 rounded-md text-sm font-medium"
            }
          >
            登录
          </button>
          <button
            onClick={() => { loadModel("register"); onChangeType?.("register") }}
            className={
              registerActive
                ? "bg-white text-blue-700 px-4 py-2 rounded-md text-sm font-medium"
                : "text-white/70 hover:text-white hover:bg-white/10 px-4 py-2 rounded-md text-sm font-medium"
            }
          >
            注册
          </button>
        </div>
      </div>
    </div>
  )
}
