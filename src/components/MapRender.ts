import * as THREE from "three";
import { Vector3 } from "three";
import { GLTF } from "three/examples/jsm/loaders/GLTFLoader";
import { MINI_PLANE_GROUND_WIDTH } from "../configs/constants";
import {
  AME_PATH,
  ENVIROMENT_PATH_GRASS_1,
  ENVIROMENT_PATH_GRASS_2,
  ENVIROMENT_PATH_ROCK_1,
  ENVIROMENT_PATH_ROCK_2,
  ENVIROMENT_PATH_ROCK_3,
  FLAG_PATH,
} from "../configs/path";
import { nodeTypeRecursive } from "../types";
import modelGLTFLoader from "../utils/gltfLoader";
import a_star from "./pathFind/a_star";
import { OrbitControls } from "three/examples/jsm/controls/OrbitControls";

class MapRender {
  ground: THREE.Group;
  terrant: THREE.Group;
  heuristicFunction: 1 | 2 | 3 = 1;
  weight = 2;
  node = this.createNode(0);
  wallNode = this.createNode(1);
  playerNode = this.createNode(2);
  targetNode = this.createNode(3);

  raycaster = new THREE.Raycaster();
  pointer = new THREE.Vector2();
  isMouseDown = false;
  wallsPosition: string[] = [];
  prevIntersect: any = null;

  objects: {
    ameModel?: GLTF;
    flagModel?: GLTF;
    rock1?: GLTF;
    rock2?: GLTF;
    rock3?: GLTF;
    grass1?: GLTF;
    grass2?: GLTF;
  } = {};
  mapArrayNumber = [
    [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
    [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
    [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
    [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
    [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
    [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
    [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
    [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
    [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
    [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
    [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
    [0, 2, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 3, 0, 0],
    [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
    [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
    [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
    [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
    [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
    [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
    [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
    [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
  ];
  mapArray: nodeTypeRecursive[][] = [];
  scene: THREE.Scene;
  camera: THREE.Camera;
  edit: boolean;
  control: OrbitControls;

  constructor(
    scene: THREE.Scene,
    camera: THREE.Camera,
    control: OrbitControls
  ) {
    this.scene = scene;
    this.camera = camera;
    this.control = control;
    this.initialize();
  }

  initialize() {
    const loadAssets = async () => {
      const models = await modelGLTFLoader([
        AME_PATH,
        FLAG_PATH,
        ENVIROMENT_PATH_ROCK_1,
        ENVIROMENT_PATH_ROCK_2,
        ENVIROMENT_PATH_ROCK_3,
        ENVIROMENT_PATH_GRASS_1,
        ENVIROMENT_PATH_GRASS_2,
      ]);
      //@ts-ignore
      const [ameModel, flagModel, rock1, rock2, rock3, grass1, grass2] = models;

      ameModel.scene.name = "ame";
      this.objects.ameModel = ameModel;
      this.objects.ameModel?.scene.scale.set(6, 6, 6);
      flagModel.scene.name = "flag";
      this.objects.flagModel = flagModel;
      this.objects.flagModel?.scene.scale.set(6, 6, 6);
      this.objects.rock1 = rock1;
      this.objects.rock1?.scene.scale.set(48, 48, 48);
      this.objects.rock2 = rock2;
      this.objects.rock2?.scene.scale.set(48, 48, 48);
      this.objects.rock3 = rock3;
      this.objects.rock3?.scene.scale.set(48, 48, 48);
      this.objects.grass1 = grass1;
      this.objects.grass1?.scene.scale.set(48, 48, 48);
      this.objects.grass2 = grass2;
      this.objects.grass2?.scene.scale.set(48, 48, 48);

      this.initMapArray(this.mapArrayNumber);
      this.initPathProperties(this.mapArrayNumber);
      this.generateMap(this.mapArray);
      this.generateTerrant(this.mapArray);
    };
    loadAssets();

    const onCurrentNodeSearch = (x: number, y: number) => {
      const currentNode = this.ground.getObjectByName(`${x}+${y}`) as any;
      if (currentNode) {
        currentNode.material.color.set(new THREE.Color(0x5f8d4e));
      }
    };

    const onCurrentNodePath = (x: number, y: number) => {
      const currentNode = this.ground.getObjectByName(`${x}+${y}`) as any;
      if (currentNode) {
        currentNode.material.color.set(new THREE.Color(0xffe15d));
      }
    };

    const onComplete = (finalNode: nodeTypeRecursive, countNode: number) => {
      let nodePath: nodeTypeRecursive | null = finalNode;
      const vectorsMove: {
        vector: Vector3;
        position: number[];
      }[] = [];

      while (nodePath) {
        if (nodePath.prevNode) {
          const currentNode = this.ground.getObjectByName(
            `${nodePath.position[1]}+${nodePath.position[0]}`
          );
          const prevNode = this.ground.getObjectByName(
            `${nodePath.prevNode.position[1]}+${nodePath.prevNode.position[0]}`
          );
          if (currentNode && prevNode) {
            vectorsMove.unshift({
              vector: new THREE.Vector3().subVectors(
                currentNode.position,
                prevNode.position
              ),
              position: nodePath.position,
            });
          }
        }

        nodePath = nodePath.prevNode;
      }

      let currentVector = 0;
      const moveChar = setInterval(() => {
        const character = this.objects.ameModel?.scene;
        // using lerp in future
        character?.position.add(vectorsMove[currentVector].vector);

        onCurrentNodePath(
          vectorsMove[currentVector].position[1],
          vectorsMove[currentVector].position[0]
        );

        currentVector += 1;

        if (currentVector === vectorsMove.length - 1) {
          clearInterval(moveChar);
        }
      }, 100);
    };

    document.querySelector("#start")?.addEventListener("click", () => {
      const findPathAstar = new a_star({
        playerNode: this.playerNode,
        targetNode: this.targetNode,
        groundGroup: this.ground,
        mapArray: this.mapArray,
        timeout: 10,
        heuristicFunction: this.heuristicFunction,
        weight: this.weight,
        onCurrentNodeSearch: onCurrentNodeSearch,
        // onCurrentNodePath: onCurrentNodePath,
        onComplete: onComplete,
      });

      findPathAstar.findPath();
    });

    Object.values(document.getElementsByClassName("map")).forEach(
      (item, index) => {
        item?.addEventListener("click", () => {
          const mapSelected = this[`mapArrayNumber`];
          this.initMapArray(mapSelected);
          this.initPathProperties(mapSelected);
          this.generateMap(this.mapArray);
          this.generateTerrant(this.mapArray);
        });
      }
    );

    document.getElementById("reset")?.addEventListener(
      "click",
      (e: any) => {
        const mapSelected = this[`mapArrayNumber`];
        this.initMapArray(mapSelected);
        this.initPathProperties(mapSelected);
        this.generateMap(this.mapArray);
        this.generateTerrant(this.mapArray);
      },
      false
    );

    document.getElementById("distance")?.addEventListener(
      "change",
      (e: any) => {
        //@ts-ignore
        this.heuristicFunction = Number(e.target.value);
      },
      false
    );

    const mainControl = document.querySelector("#mainControl");
    const toggleEdit = document.querySelector("#edit");
    const mainEdit = document.querySelector("#mainEdit");
    const edited = document.querySelector("#edited");

    toggleEdit?.addEventListener("click", () => {
      this.control.enableDamping = false;
      // prevent glosbe when control damping make the final position wrong
      setTimeout(() => {
        this.control.saveState();
        mainEdit?.classList.remove("translate-x-[450px]");
        mainControl?.classList.add("translate-x-[450px]");
        this.camera.position.set(0, 100, 300);
        this.edit = true;
      }, 100);
    });

    edited?.addEventListener("click", () => {
      this.onEditComplete();
    });

    window.addEventListener(
      "mousemove",
      (e) => {
        this.pointer.x = (e.clientX / window.innerWidth) * 2 - 1;
        this.pointer.y = -(e.clientY / window.innerHeight) * 2 + 1;
      },
      false
    );

    window.addEventListener(
      "mousedown",
      (e) => {
        this.isMouseDown = true;
      },
      false
    );

    window.addEventListener(
      "mouseup",
      (e) => {
        this.isMouseDown = false;
      },
      false
    );
  }

  onEditComplete() {
    const mainControl = document.querySelector("#mainControl");
    const mainEdit = document.querySelector("#mainEdit");

    this.edit = false;
    this.control.reset();
    this.control.enableDamping = true;
    this.control.enabled = true;
    mainEdit?.classList.add("translate-x-[450px]");
    mainControl?.classList.remove("translate-x-[450px]");

    this.wallsPosition.forEach((item, index) => {
      const indexArray = item.split("+");
      this.mapArrayNumber[indexArray[1]][indexArray[0]] = 1;
    });

    const mapSelected = this[`mapArrayNumber`];
    this.initMapArray(mapSelected);
    this.initPathProperties(mapSelected);
    this.generateMap(this.mapArray);
    this.generateTerrant(this.mapArray);

    this.wallsPosition = [];
  }

  initMapArray(arrayMapNumber: number[][]) {
    this.mapArray = arrayMapNumber.map((row, rowIndex) =>
      row.map((col, colIndex) => {
        let returnNode: any = {
          position: [rowIndex, colIndex],
        };

        switch (col) {
          case 1:
            returnNode = { ...this.wallNode };
            break;
          case 2:
            returnNode = { ...returnNode, ...this.playerNode };
            break;
          case 3:
            returnNode = { ...returnNode, ...this.targetNode };
            break;
          default:
            returnNode = { ...returnNode, ...this.node };
            break;
        }

        return returnNode;
      })
    );
  }

  initPathProperties(arrayMapNumber: number[][]) {
    let playerPos = [0, 0];
    let targetPos = [0, 0];
    arrayMapNumber.forEach((row, rowIndex) => {
      row.forEach((col, colIndex) => {
        if (col === 2) {
          playerPos = [rowIndex, colIndex];
        } else if (col === 3) {
          targetPos = [rowIndex, colIndex];
        }
      });
    });
    this.playerNode.position = playerPos;
    this.targetNode.position = targetPos;
  }

  generateMap(mapArray: nodeTypeRecursive[][]) {
    this.scene.remove(this.ground);
    this.ground = new THREE.Group();

    const planeWidth = MINI_PLANE_GROUND_WIDTH;
    const planeSpace = 1;
    const mapWidth = mapArray[0].length * planeWidth * planeSpace;
    const mapHeight = mapArray.length * planeWidth * planeSpace;

    mapArray.forEach((row: any, indexRow: number) => {
      row.forEach((item: any, indexItem: number) => {
        const groundBlock = new THREE.Mesh(
          new THREE.BoxGeometry(planeWidth, planeWidth, planeWidth),
          new THREE.MeshStandardMaterial({ color: 0x285430 })
        );

        groundBlock.position.set(
          planeWidth * (indexItem * planeSpace),
          0,
          planeWidth * (indexRow * planeSpace)
        );
        groundBlock.name = `${indexItem}+${indexRow}`;
        groundBlock.material.transparent = true;
        groundBlock.material.opacity = 1;
        groundBlock.receiveShadow = true;
        this.ground.add(groundBlock);
      });
    });

    this.ground.position.set(-(mapWidth / 2), 0, -(mapHeight / 2));

    this.scene.add(this.ground);
  }

  generateTerrant(mapArray: nodeTypeRecursive[][]) {
    this.scene.remove(this.terrant);
    this.terrant = new THREE.Group();

    const planeWidth = MINI_PLANE_GROUND_WIDTH;
    const planeSpace = 1;
    const mapWidth = mapArray[0].length * planeWidth * planeSpace;
    const mapHeight = mapArray.length * planeWidth * planeSpace;

    mapArray.forEach((row: any, indexRow: number) => {
      row.forEach((item: any, indexItem: number) => {
        let blockClone;

        switch (item.code) {
          case 1:
            {
              const randomNumber = Math.ceil(Math.random() * 3);
              blockClone = this.objects[`rock${randomNumber}`]?.scene.clone();
            }
            break;
          case 2:
            {
              blockClone = this.objects.ameModel?.scene;
            }
            break;
          case 3:
            blockClone = this.objects.flagModel?.scene.clone();
            break;
          default:
            blockClone = null;
            break;
        }

        if (blockClone && !blockClone?.scene) {
          let positionY = 0;
          let positionX = 0;
          let positionZ = 0;

          if (blockClone.name === "ame") {
            positionY = -2;
          }

          if (blockClone.name === "flag") {
            positionY = -2;
            positionX = -2;
            positionZ = -3;
          }

          blockClone.traverse((item) => (item.castShadow = true));

          blockClone.position.set(
            planeWidth * (indexItem * planeSpace) + positionX,
            positionY,
            planeWidth * (indexRow * planeSpace) + positionZ
          );

          this.terrant.add(blockClone);
        }
      });
    });

    this.terrant.position.set(-(mapWidth / 2), 4, -(mapHeight / 2));
    this.scene.add(this.terrant);
  }

  createNode(code: number) {
    const node: nodeTypeRecursive = {
      f: code == 2 ? 0 : Number.MAX_SAFE_INTEGER,
      g: code == 2 ? 0 : Number.MAX_SAFE_INTEGER,
      code,
      position: code == 3 ? [0, 1] : [0, 0],
      prevNode: null,
    };

    return node;
  }

  update() {
    if (this.edit) {
      this.camera.position.lerp(new Vector3(0, 300, 0), 0.07);
      this.camera.lookAt(0, 0, 0);
      this.control.enabled = false;

      this.raycaster.setFromCamera(this.pointer, this.camera);

      const intersects = this.raycaster.intersectObjects(this.ground.children);

      if (this.prevIntersect) {
        this.prevIntersect.material.opacity = 1;
      }

      const intersectObjName = intersects[0]?.object.name;
      const intersectObj = this.ground.getObjectByName(intersectObjName) as any;
      if (intersectObj) {
        this.prevIntersect = intersectObj;

        if (!this.isMouseDown) {
          this.prevIntersect = intersectObj;
        } else {
          if (!this.wallsPosition.includes(intersectObjName)) {
            this.wallsPosition.push(intersectObjName);
          }
          this.prevIntersect = null;
        }

        intersectObj.material.opacity = 0.5;
      }
    }
  }
}

export default MapRender;
