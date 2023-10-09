import './style.css'

import * as THREE from 'three'

import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js'
// import { OrbitControls } from 'three/addons/controls/OrbitControls.js'


const renderer = new THREE.WebGLRenderer({
  alpha: true,
  antialias: true,
  canvas: document.querySelector('#bg'),
})
renderer.shadowMap.enabled = true
renderer.setSize(window.innerWidth, window.innerHeight)



const scene = new THREE.Scene()
const camera = new THREE.PerspectiveCamera(
	75, 
	window.innerWidth / window.innerHeight, 
	0.1, 
	1000
)

// camera.position.z = 5
camera.position.set(6.61, 8.74, 28)

const orbit = new OrbitControls(camera, renderer.domElement)
orbit.update()
orbit.enabled = false

class Box extends THREE.Mesh {
  constructor({ width, height, depth, color = '#00FF00', 
    velocity = {
      x: 0,
      y: 0,
      z: 0
    },
    position = {
      x: 0,
      y: 0,
      z: 0
    },
    zAcceleration = false
  }) {
    super(
      new THREE.BoxGeometry(width, height, depth),
      new THREE.MeshStandardMaterial({ color })
    )

    this.width = width
    this.height = height
    this.depth = depth
    
    this.position.set(position.x, position.y, position.z)

    this.right = this.position.x + this.width / 2
    this.left = this.position.x - this.width / 2

    this.bottom = this.position.y - this.height / 2
    this.top = this.position.y + this.height / 2

    this.front = this.position.z + this.depth / 2
    this.back = this.position.z - this.depth / 2

    this.velocity = velocity
    this.gravity = -0.002

    this.zAcceleration = zAcceleration
  }

  updateSides() {
    this.right = this.position.x + this.width / 2
    this.left = this.position.x - this.width / 2

    this.bottom = this.position.y - this.height / 2
    this.top = this.position.y + this.height / 2

    this.front = this.position.z + this.depth / 2
    this.back = this.position.z - this.depth / 2
  }

  update(ground) {
    this.updateSides()

    if (this.zAcceleration) this.velocity.z += 0.0001

    this.position.x += this.velocity.x
    this.position.z += this.velocity.z

    // detect for collisions on the x axis
    // console.log(ground)
    

    this.applyGravity(ground)
  }

  applyGravity(ground) {
    this.velocity.y += this.gravity

    // if (this.bottom + this.velocity.y <= ground.top) {
    if (
      boxCollision({
        box1: this,
        box2: ground
      })
    ) {
      const friction = 0.5
      this.velocity.y *= friction

      this.velocity.y = -this.velocity.y
    }
    else this.position.y += this.velocity.y
  }
}

function boxCollision({ box1, box2 }) {
  const xCollision = box1.right >= box2.left && box1.left <= box2.right
  const yCollision = box1.bottom + box1.velocity.y <= box2.top && box1.top >= box2.bottom
  const zCollision = box1.front >= box2.back && box1.back <= box2.front

  return xCollision && yCollision && zCollision
  // if ( xCollision && yCollision && zCollision) {
  //   console.log('Collision on the x asix')
  // }
}


// Cube
// const geometry = new THREE.BoxGeometry(1, 1, 1)
// const material = new THREE.MeshStandardMaterial({ color: 0x00FF00, wireframe: false })
const cube = new Box({
  width: 1,
  height: 1,
  depth: 1,
  velocity: {
    x: 0,
    y: -0.01,
    z: 0
  },
})
cube.castShadow = true
scene.add(cube)

// Ground
const ground = new Box({
  width: 10,
  height: 0.5,
  depth: 50,
  color: '#0369a1',
  position: {
    x: 0,
    y: -2,
    z: 0
  }
})

ground.receiveShadow = true
// ground.position.y = -2
scene.add(ground)

// DirectionalLight
const directionalLight = new THREE.DirectionalLight(0xFFFFFF, 0.8)
directionalLight.position.set(0, 1, 4)
directionalLight.castShadow = true
scene.add(directionalLight)

scene.add((new THREE.AmbientLight(0xFFFFFF, 0, 5)))
// const dLightHelper = new THREE.DirectionalLightHelper(directionalLight, 5)
// scene.add(dLightHelper)

const keys = {
  a: {
    pressed: false
  },
  d: {
    pressed: false
  },
  w: {
    pressed: false
  },
  s: {
    pressed: false
  },
}

window.addEventListener('keydown', (event) => {
  switch (event.code) {
    case 'KeyA':
      keys.a.pressed = true
      break
    case 'KeyD':
      keys.d.pressed = true
      break
    case 'KeyW':
      keys.w.pressed = true
      break
    case 'KeyS':
      keys.s.pressed = true
      break
    case 'Space':
      cube.velocity.y = 0.08
      break
  }
})

window.addEventListener('keyup', (event) => {
  switch (event.code) {
    case 'KeyA':
      keys.a.pressed = false
      break
    case 'KeyD':
      keys.d.pressed = false
      break
    case 'KeyW':
      keys.w.pressed = false
      break
    case 'KeyS':
      keys.s.pressed = false
      break
  }
})

let touchstartX = 0
let touchendX = 0
let touchstartZ = 0
let touchendZ = 0
let lastClick = 0;

const swipes = {
  left: {
    pressed: false
  },
  right: {
    pressed: false
  },
  forward: {
    pressed: false
  },
  back: {
    pressed: false
  }
}
// let leftswipe = false
// let rightswipe = false
// let stopswipe = false
// let forwardswipe = false
// let backswipe = false
  
function checkDirection() {
  if (stop) {
    swipes.left.pressed = false
    swipes.right.pressed = false
    swipes.forward.pressed = false
    swipes.back.pressed = false
    // console.log("stop")
  }
  else if (touchendX < touchstartX) {
    // console.log("left")
    swipes.left.pressed = true
    swipes.right.pressed = false
    // leftside = true
    // rightside = false
  }
  // keys.a.pressed = true
  
  else if (touchendX > touchstartX) {
  // keys.d.pressed = true
    swipes.left.pressed = false
    swipes.right.pressed = true
    
    // leftside = false
    // rightside = true
    // console.log("right")
  }

  if (stop) {
  //   // leftside = false
  //   // rightside = false
  //   // forwardside = false
  //   // backside = false
  //   // console.log("stop")
    swipes.left.pressed = false
    swipes.right.pressed = false
    swipes.forward.pressed = false
    swipes.back.pressed = false
  }
  else if (touchendZ > touchstartZ) {
    
    swipes.forward.pressed = true
    swipes.back.pressed = false
    // backside = false
    // console.log("back")
  }
  else if (touchendZ < touchstartZ) {
    // keys.d.pressed = true
    // forwardside = false
    swipes.forward.pressed = false
    swipes.back.pressed = true
    // console.log("forward")
  }
}

document.addEventListener('touchstart', e => {
  stop = false
  touchstartX = e.changedTouches[0].screenX
  touchstartZ = e.changedTouches[0].screenY
  // if (e.targetTouches.length === 2) cube.velocity.y = 0.08
  // e.preventDefault(); // to disable browser default zoom on double tap
  let date = new Date();
  let time = date.getTime();
  const time_between_taps = 200; // 200ms
  if (time - lastClick < time_between_taps) {
    // do stuff
    cube.velocity.y = 0.08
  }
  lastClick = time;
  // touchstartZ = e.changedTouches[0].screenZ
})

document.addEventListener('touchmove', e => {
  stop = false
  touchendX = e.changedTouches[0].screenX
  touchendZ = e.changedTouches[0].screenY
// //   // touchendZ = e.changedTouches[0].screenZ
  checkDirection()
})

document.addEventListener('touchend', e => {
  stop = true
  // stop = false
  touchendX = e.changedTouches[0].screenX
  touchendZ = e.changedTouches[0].screenY
  // console.log("stop")
  checkDirection()
})

///

// document.addEventListener('touchstart', e => {
//   // stop = false
//   touchstartZ = e.changedTouches[0].screenY
// })

// document.addEventListener('touchmove', e => {
//   // stop = false
//   touchendZ = e.changedTouches[0].screenY
//   checkDirection()
// })

// document.addEventListener('touchend', e => {
//   stop = true
//   touchendZ = e.changedTouches[0].screenY
//   checkDirection()
// })

const enemies = []
let frames = 0
let spawnRate = 200

function animate() {
  const animationId = requestAnimationFrame(animate) 
  renderer.render(scene, camera)

  // movement code
  cube.velocity.x = 0
  cube.velocity.z = 0
  if (keys.a.pressed) cube.velocity.x = -0.08
  else if (keys.d.pressed) cube.velocity.x = 0.08
  if (keys.w.pressed) cube.velocity.z = -0.08
  else if (keys.s.pressed) cube.velocity.z = 0.08

  if (swipes.left.pressed) cube.velocity.x = -0.08
  else if (swipes.right.pressed) cube.velocity.x = 0.08
  // else if (stop) cube.velocity.x = 0
  if (swipes.forward.pressed) cube.velocity.z = 0.08
  else if (swipes.back.pressed) cube.velocity.z = -0.08
  // else if (stop) cube.velocity.z = 0

  cube.update(ground)
  enemies.forEach((enemy) => {
    enemy.update(ground)
    if (
      boxCollision({
        box1: cube,
        box2: enemy
      })
    ) {
      cancelAnimationFrame(animationId)
      var result = confirm("Game, как говорится, Over. Do you want to play again?")
      if (result == true)
        location.reload()
      else return
    }
  })

  if (frames % spawnRate === 0) {
    if (spawnRate > 20) spawnRate -= 10

      const enemy = new Box({
        width: 1,
        height: 1,
        depth: 1,
        position: {
          x: (Math.random() - 0.5) * 10,
          y: 0,
          z: -20
        },
        velocity: {
          x: 0,
          y: 0,
          z: 0.005
        },
        color: 'red',
        zAcceleration: true
      })
      enemy.castShadow = true
      scene.add(enemy)
      enemies.push(enemy)
    }
  frames++
}

animate()