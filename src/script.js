import * as THREE from "three"
import * as dat from "lil-gui"
import { gsap } from "gsap"
import { OrbitControls } from "three/examples/jsm/controls/OrbitControls.js"
import { GLTFLoader } from "three/examples/jsm/loaders/GLTFLoader.js"
import { DRACOLoader } from "three/examples/jsm/loaders/DRACOLoader.js"
import { RoomEnvironment } from "three/addons/environments/RoomEnvironment.js"

import JSConfetti from "js-confetti"

/**
 ******************************
 ****** Three.js Initial ******
 ******************************
 */

/**
 * Init
 */
// Canvas
const canvas = document.querySelector("canvas.webgl")

// Scene
const scene = new THREE.Scene()
// scene.background = new THREE.Color(0xffffff)

// Renderer
const renderer = new THREE.WebGLRenderer({
  canvas: canvas,
  antialias: true,
})
renderer.LinearEncoding = THREE.SRGBColorSpace
renderer.toneMapping = THREE.CineonToneMapping
renderer.toneMappingExposure = 1.75
renderer.shadowMap.enabled = true
renderer.shadowMap.type = THREE.PCFSoftShadowMap
renderer.setClearColor("#211d20")
renderer.setSize(window.innerWidth, window.innerHeight)
renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2))

// camera
const size = 5
const cameraWidth = (size * window.innerWidth) / window.innerHeight / 2
const cameraHeight = size / 2
const camera = new THREE.OrthographicCamera(
  -cameraWidth,
  cameraWidth,
  cameraHeight,
  -cameraHeight,
  1,
  1000
)
camera.position.set(0, 0, 10)
scene.add(camera)

/**
 * Addition
 */

// Lights
// const ambientLight = new THREE.AmbientLight(0xffffff, 4)
// scene.add(ambientLight)

// Controls
// const orbitControl = new OrbitControls(camera, renderer.domElement)
// orbitControl.enableDamping = true

// MODELVIEWER
let pmremGenerator = new THREE.PMREMGenerator(renderer)
scene.environment = pmremGenerator.fromScene(new RoomEnvironment(), 0.04).texture

// Axes
// const axes = new THREE.AxesHelper(10)
// scene.add(axes)

// Draco
const dracoLoader = new DRACOLoader()
dracoLoader.setDecoderPath("/draco/")

// Loading
const manager = new THREE.LoadingManager()

// GLTF Loader
const gltfLoader = new GLTFLoader(manager)
gltfLoader.setDRACOLoader(dracoLoader)

// Raycaster
let raycaster = new THREE.Raycaster()

/**
 ******************************
 ************ Main ************
 ******************************
 */

// Loading Progress Bar
manager.onProgress = function (url, itemsLoaded, itemsTotal) {
  document.querySelector(".progressbar").style.width =
    (itemsLoaded / itemsTotal) * 100 + "%"
  if (itemsLoaded === itemsTotal) {
    document.querySelector("#instructions").innerHTML = `
                <span class="buttonload" stu>
                    <i class="fa fa-spinner fa-spin"></i>Click to Start!
                </span>
            `
    window.addEventListener("mousedown", (e) => {
      try {
        document.querySelector(".progress").style.opacity = 1
        document.querySelector("#blocker").style.opacity = 1

        gsap.to(document.querySelector(".progress").style, {
          opacity: 0,
          duration: 2,
          delay: 1,
        })
        gsap.to(document.querySelector("#blocker").style, {
          opacity: 0,
          duration: 2,
          delay: 1,
          onComplete: () => {
            document.querySelector(".progress").remove()
            document.querySelector("#blocker").remove()
            setTimeout(() => {
              sequence()
            }, 500)
          },
        })
      } catch {}
    })

    window.addEventListener("touchstart", (e) => {
      try {
        document.querySelector(".progress").style.opacity = 1
        document.querySelector("#blocker").style.opacity = 1

        gsap.to(document.querySelector(".progress").style, {
          opacity: 0,
          duration: 2,
          delay: 1,
        })
        gsap.to(document.querySelector("#blocker").style, {
          opacity: 0,
          duration: 2,
          delay: 1,
          onComplete: () => {
            document.querySelector(".progress").remove()
            document.querySelector("#blocker").remove()
            setTimeout(() => {
              sequence()
            }, 500)
          },
        })
      } catch {}
    })
  }
}

/**
 * Definitions
 */
// Confetti
const jsConfetti = new JSConfetti()

// Audio
const audioLoader = new THREE.AudioLoader()
const audioListener = new THREE.AudioListener()
const audio = new THREE.Audio(audioListener)

// Game parameters
let cursor
let level = 1 // Number of cards
let subLevel = 1 // Different cards for each level
let autoPass = 0
let promptLimit = 0
let cardPosition = []
let targetObject
let cardPositions = [
  [-cameraWidth / 2, cameraHeight / 2, 0],
  [cameraWidth / 2, -cameraHeight / 2, 0],
  [cameraWidth / 2, cameraHeight / 2, 0],
  [-cameraWidth / 2, -cameraHeight / 2, 0],
]
let mouse = new THREE.Vector2()
let isPickAvailable = false
let isUserMode = false

/**
 * Assets
 */
let assets = ["Dentist", "Doctor", "Nurse"]
// Audios
const audios = [
  `audios/${assets[0]}.mp3`,
  `audios/${assets[1]}.mp3`,
  `audios/${assets[2]}.mp3`,
]
console.log(audios)

// Prompt
gltfLoader.load("models/cursor.glb", (gltf) => {
  cursor = gltf.scene.children[0]
  console.log(cursor)
  cursor.material.depthTest = false
  cursor.material.depthWrite = false
  cursor.renderOrder = 1
  cursor.material.opacity = 0
  scene.add(cursor)
})

// Card
const cardGeometry = new THREE.PlaneGeometry(1.92 * 1.8, 1.08 * 1.8)

const video1 = document.createElement("video")
video1.src = `videos/${assets[0]}.mp4`
video1.muted = true
video1.load()
video1.play()
video1.loop = true
const texture1 = new THREE.VideoTexture(video1)
texture1.minFilter = THREE.LinearFilter
texture1.magFilter = THREE.LinearFilter
texture1.colorSpace = THREE.SRGBColorSpace
const material1 = new THREE.MeshBasicMaterial({ map: texture1 })
const card_1 = new THREE.Mesh(cardGeometry, material1)

const video2 = document.createElement("video")
video2.src = `videos/${assets[1]}.mp4`
video2.muted = true
video2.load()
video2.play()
video2.loop = true
const texture2 = new THREE.VideoTexture(video2)
texture2.minFilter = THREE.LinearFilter
texture2.magFilter = THREE.LinearFilter
texture2.colorSpace = THREE.SRGBColorSpace
const material2 = new THREE.MeshBasicMaterial({ map: texture2 })
const card_2 = new THREE.Mesh(cardGeometry, material2)

const video3 = document.createElement("video")
video3.src = `videos/${assets[2]}.mp4`
video3.muted = true
video3.load()
video3.play()
video3.loop = true
const texture3 = new THREE.VideoTexture(video3)
texture3.minFilter = THREE.LinearFilter
texture3.magFilter = THREE.LinearFilter
texture3.colorSpace = THREE.SRGBColorSpace
const material3 = new THREE.MeshBasicMaterial({ map: texture3 })
const card_3 = new THREE.Mesh(cardGeometry, material3)

let cards = [card_1, card_2, card_3]

/**
 * Sequence
 */
function sequence() {
  isPickAvailable = true
  if (level == 1) {
    if (isUserMode) {
      scene.add(cards[subLevel - 1])
      showPrompt()
    } else {
      randCard()
      cards[subLevel - 1].position.set(...cardPosition[0])
      playSound(audios[subLevel - 1])
      scene.add(cards[subLevel - 1])
      setTimeout(() => {
        scene.remove(cards[subLevel - 1])
        isUserMode = true
        setTimeout(() => {
          sequence()
        }, 2000)
      }, 5000)
    }
  } else if (level == 2) {
    randCard()
    cards[subLevel - 1].position.set(...cardPosition[0])
    cards[subLevel % 3].position.set(...cardPosition[1])
    playSound(audios[subLevel - 1])
    scene.add(cards[subLevel - 1])
    scene.add(cards[subLevel % 3])
    showPrompt()
  } else if (level == 3) {
    randCard()
    cards[subLevel - 1].position.set(...cardPosition[0])
    cards[subLevel % 3].position.set(...cardPosition[1])
    cards[(subLevel + 1) % 3].position.set(...cardPosition[2])
    cursor.visible = false
    showPrompt()
    playSound(audios[subLevel - 1])
    scene.add(cards[subLevel - 1])
    scene.add(cards[subLevel % 3])
    scene.add(cards[(subLevel + 1) % 3])
  }
}

/**
 * Functioins
 */
function randCard() {
  let tempCardPositions = cardPositions
  cardPosition = tempCardPositions.sort(() => 0.5 - Math.random())
}

function showPrompt() {
  if (level != 1) playSound(audios[subLevel - 1])
  isPickAvailable = true
  cursor.position.set(...cardPosition[0])
  cursor.scale.set(1, 1, 1)
  gsap.to(cursor.material, {
    opacity: 1,
    duration: 1,
    onComplete: () => {
      gsap.to(cursor.scale, {
        x: 0.7,
        y: 0.7,
        z: 0.7,
        duration: 0.5,
        repeat: 5,
        yoyo: true,
        ease: "linear",
        onComplete: () => {
          hidePrompt()
          let tempSublevel = subLevel
          let tempLevel = level
          setTimeout(() => {
            if (tempLevel == level && tempSublevel == subLevel) {
              promptLimit++
              if (autoPass == 1 && promptLimit == 1) {
                location.reload()
              }
              if (promptLimit == 3) {
                promptLimit = 0
                autoInteraction()
              } else {
                showPrompt()
              }
            }
          }, 4000)
        },
      })
    },
  })
}

function hidePrompt() {
  cursor.scale.set(1, 1, 1)
  gsap.to(cursor.material, {
    opacity: 0,
    duration: 0.5,
    onComplete: () => {
      gsap.killTweensOf(cursor.material)
      gsap.killTweensOf(cursor.scale)
    },
  })
}

function autoInteraction() {
  autoPass++
  isPickAvailable = false
  hidePrompt()
  for (let i = 0; i < 3; i++) scene.remove(cards[i])
  isUserMode = false
  subLevel++
  if (subLevel == 4) {
    subLevel = 1
    level++
    if (level == 4) location.reload()
  }
  setTimeout(() => {
    sequence()
  }, 2000)
}

function playSound(audioFile) {
  audioLoader.load(audioFile, (buffer) => {
    audio.setBuffer(buffer)
    audio.setLoop(false)
    audio.setVolume(0.5)
    audio.play()
  })
}

function confetti() {
  jsConfetti.addConfetti({
    confettiRadius: 3,
    confettiNumber: 500,
  })

  jsConfetti.addConfetti({
    emojis: ["✰"],
    emojiSize: 15,
  })
}

/**
 * Events
 */
window.addEventListener("mousedown", (event) => {
  mouse.x = (event.clientX / window.innerWidth) * 2 - 1
  mouse.y = -(event.clientY / window.innerHeight) * 2 + 1

  raycaster.setFromCamera(mouse, camera)
  const intersects = raycaster.intersectObjects(scene.children, true)

  if (intersects.length > 0) {
    targetObject = intersects[0].object
    if (isPickAvailable) {
      if (targetObject === cards[subLevel - 1]) {
        autoPass = 0
        promptLimit = 0
        confetti()
        isPickAvailable = false
        hidePrompt()
        playSound(audios[subLevel - 1])
        for (let i = 0; i < 3; i++) scene.remove(cards[i])
        isUserMode = false
        subLevel++
        if (subLevel == 4) {
          subLevel = 1
          level++
          if (level == 4) location.reload()
        }
        setTimeout(() => {
          sequence()
        }, 2000)
      }
    }
  }
})

// Auto Resize
window.addEventListener("resize", () => {
  console.log("reszing")
  const newAspect = window.innerWidth / window.innerHeight

  camera.left = (size * newAspect) / -2
  camera.right = (size * newAspect) / 2

  camera.updateProjectionMatrix()

  renderer.setSize(window.innerWidth, window.innerHeight)
})

/**
 * Animate
 */
const animate = () => {
  // orbitControl.update()
  // Render Scene
  renderer.render(scene, camera)

  raycaster.setFromCamera(mouse, camera)

  // Call animate again on the next frame
  window.requestAnimationFrame(animate)
}

animate()
