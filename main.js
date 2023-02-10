import './style.css'

import * as THREE from 'three';

import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls'
import { FBXLoader } from 'three/examples/jsm/loaders/FBXLoader'


// Scene
const scene = new THREE.Scene();
scene.background = new THREE.Color( 0x415c3e );

const camera = new THREE.PerspectiveCamera(
  50, 
  window.innerWidth / window.innerHeight, 
  0.1, 
  2500
);
camera.position.set(400, 400, 400);

const renderer = new THREE.WebGLRenderer({
  canvas: document.querySelector('#bg')
});

renderer.setPixelRatio(window.devicePixelRatio);
renderer.setSize( window.innerWidth, window.innerHeight);

renderer.shadowMap.enabled = true;
renderer.shadowMap.type = THREE.PCFShadowMap;

window.addEventListener('resize', onWindowResize, false)

function onWindowResize() {
    camera.aspect = window.innerWidth / window.innerHeight
    camera.updateProjectionMatrix()
    renderer.setSize(window.innerWidth, window.innerHeight)
    render()
}

// Plane
const planeGeometry = new THREE.PlaneGeometry( 1000, 1000, 32, 32 );
const grassTexture = new THREE.TextureLoader().load('./textures/grass.jpg');
const planeMaterial = new THREE.MeshStandardMaterial( { color: 0x71946c, map: grassTexture } )
const plane = new THREE.Mesh( planeGeometry, planeMaterial );
plane.receiveShadow = true;
plane.rotation.set (-1.57, 0, 0);
scene.add( plane );


// Light
const light = new THREE.PointLight( 0xffffff, 10, 1000 );
light.position.set( 200, 500, 200 );
light.castShadow = true;
scene.add( light );


// Model + animations
let mixer = THREE.AnimationMixer;
const animationActions = [];
const fbxLoader = new FBXLoader()
let modelReady = false;

fbxLoader.load(
    './model/deer.fbx',
    (object) => {

        object.traverse( child => {
            if (child.isMesh) {
                child.castShadow = true;
            }
          });
  
        object.scale.set(0.5, 0.5, 0.5)

        mixer = new THREE.AnimationMixer(object);

        const objectAnimations = object.animations;

        objectAnimations.forEach((action,index) => {
          animationActions[index] = mixer.clipAction(action);
        })

        modelReady = true;

        scene.add(object)
    },
    (xhr) => {
        console.log((xhr.loaded / xhr.total) * 100 + '% loaded')
    },
    (error) => {
        console.log(error)
    }
);


const startActionButtons = ['button-idle','button-die'];

startActionButtons.forEach((button, index) =>
  document.getElementById(button).addEventListener('click', function() {
    animationActions.forEach(action => {
      action.stop();
    });
    animationActions[index].play();
  })
);


// Controls
const controls = new OrbitControls(camera, renderer.domElement)
controls.enableDamping = true
controls.target.set(0, 1, 0)


const clock = new THREE.Clock()

function render() {
  renderer.render(scene, camera)
}

function animate() {
  requestAnimationFrame(animate)

  controls.update()

  if (modelReady) mixer.update(clock.getDelta())

  render()
}

animate()

