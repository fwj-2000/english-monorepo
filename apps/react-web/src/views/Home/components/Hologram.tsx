import { useRef, useEffect } from 'react'
import * as THREE from 'three'
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader.js'
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js'

export default function Hologram() {
  const canvasRef = useRef<HTMLCanvasElement>(null)

  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return
    const scene = new THREE.Scene()
    const clock = new THREE.Clock()
    let mixer: THREE.AnimationMixer | null = null

    const camera = new THREE.PerspectiveCamera(75, 500 / 250, 0.1, 1000)
    camera.position.set(0, 0, 10)

    const loader = new GLTFLoader()
    loader.load('/models/hologram/scene.gltf', gltf => {
      scene.add(gltf.scene)
      gltf.scene.scale.set(4, 4, 4)
      if (gltf.animations?.length) {
        mixer = new THREE.AnimationMixer(gltf.scene)
        gltf.animations.forEach(clip => mixer!.clipAction(clip).play())
      }
    })

    scene.add(new THREE.AmbientLight(0xffffff, 1))
    const dirLight = new THREE.DirectionalLight(0xffffff, 2)
    dirLight.position.set(5, 10, 7.5)
    scene.add(dirLight)

    const renderer = new THREE.WebGLRenderer({ canvas, antialias: true, alpha: true })
    renderer.setSize(500, 250)
    const controls = new OrbitControls(camera, renderer.domElement)
    let animId: number
    const animate = () => {
      animId = requestAnimationFrame(animate)
      mixer?.update(clock.getDelta())
      scene.rotation.y += 0.002
      controls.update()
      renderer.render(scene, camera)
    }
    animate()

    return () => {
      cancelAnimationFrame(animId)
      renderer.dispose()
      controls.dispose()
    }
  }, [])

  return <canvas ref={canvasRef} />
}
