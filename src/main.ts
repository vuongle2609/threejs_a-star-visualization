import * as THREE from "three";
import { OrbitControls } from "three/examples/jsm/controls/OrbitControls";
import Light from "./components/light";
import MapRender from "./components/MapRender";
import "./style.css";

class Three {
  renderer: THREE.WebGLRenderer;
  scene: THREE.Scene;
  camera: THREE.PerspectiveCamera;
  control: OrbitControls;
  mainCanvas: any;

  constructor() {
    this.initialize();
  }

  initialize() {
    this.mainCanvas = document.querySelector("#mainCanvas");

    this.renderer = new THREE.WebGLRenderer({
      antialias: true,
      canvas: this.mainCanvas || undefined,
    });

    this.renderer.setSize(window.innerWidth, window.innerHeight);
    this.renderer.shadowMap.enabled = true;

    // document.body.appendChild(this.renderer.domElement);

    window.addEventListener(
      "resize",
      () => {
        this.onWindowResize();
      },
      false
    );

    this.camera = new THREE.PerspectiveCamera(
      20,
      window.innerWidth / window.innerHeight,
      1.0,
      5000
    );

    this.scene = new THREE.Scene();
    this.scene.background = new THREE.Color("#FAEAB1");

    const light = new Light(this.scene);

    const mapRender = new MapRender(this.scene);

    this.control = new OrbitControls(this.camera, this.renderer.domElement);

    this.camera.position.set(0, 300, 0);
    this.camera.lookAt(0, 0, 0);

    this.RAF(0);
  }

  onWindowResize() {
    this.camera.aspect = window.innerWidth / window.innerHeight;
    this.camera.updateProjectionMatrix();
    this.renderer.setSize(window.innerWidth, window.innerHeight);
  }

  RAF(t: number) {
    requestAnimationFrame((t) => {
      this.RAF(t);
    });

    this.renderer.render(this.scene, this.camera);
  }
}

new Three();
