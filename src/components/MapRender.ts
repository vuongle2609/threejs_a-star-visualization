import * as THREE from "three";
import { Vector3 } from "three";
import { OrbitControls } from "three/examples/jsm/controls/OrbitControls";
import { GLTF } from "three/examples/jsm/loaders/GLTFLoader";
import {
  GROUND_CODE,
  MINI_PLANE_GROUND_WIDTH,
  PLAYER_CODE,
  TARGET_CODE,
} from "../configs/constants";
import {
  AME_PATH,
  ENVIROMENT_PATH_ROCK_1,
  ENVIROMENT_PATH_ROCK_2,
  ENVIROMENT_PATH_ROCK_3,
  FLAG_PATH,
} from "../configs/path";
import { nodeTypeRecursive } from "../types";
import modelGLTFLoader from "../utils/gltfLoader";
import { WALL_CODE } from "./../configs/constants";
import a_star from "./pathFind/a_star";
class MapRender {
  ground: THREE.Group;
  terrant: THREE.Group;
  heuristicFunction: 1 | 2 | 3 = 1;
  weight = 2;
  node = this.createNode(GROUND_CODE);
  wallNode = this.createNode(WALL_CODE);
  playerNode = this.createNode(PLAYER_CODE);
  targetNode = this.createNode(TARGET_CODE);

  raycaster = new THREE.Raycaster();
  pointer = new THREE.Vector2();
  isMouseDown = false;
  wallsPosition: { [key: string]: any } = {};
  prevIntersect: any = null;

  objects: {
    ameModel?: GLTF;
    flagModel?: GLTF;
    rock1?: GLTF;
    rock2?: GLTF;
    rock3?: GLTF;
  } = {};
  mapArrayNumber = [
    [0, 2, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
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
    [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 3, 0, 0],
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
  defaultEditModes = {
    draw: false,
    eraser: false,
    target: false,
    start: false,
  };
  editModes = {
    draw: false,
    eraser: false,
    target: false,
    start: false,
  };
  control: OrbitControls;
  character: THREE.Group | undefined;
  characterCurrentPosition = new Vector3();

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
      ]);
      //@ts-ignore
      const [ameModel, flagModel, rock1, rock2, rock3, grass1, grass2] = models;

      ameModel.scene.name = "ame";
      this.objects.ameModel = ameModel;
      this.objects.ameModel?.scene.scale.set(6, 6, 6);
      this.character = this.objects.ameModel?.scene;
      flagModel.scene.name = "flag";
      this.objects.flagModel = flagModel;
      this.objects.flagModel?.scene.scale.set(6, 6, 6);
      this.objects.rock1 = rock1;
      this.objects.rock1?.scene.scale.set(48, 48, 48);
      this.objects.rock2 = rock2;
      this.objects.rock2?.scene.scale.set(48, 48, 48);
      this.objects.rock3 = rock3;
      this.objects.rock3?.scene.scale.set(48, 48, 48);

      this.initMapArray(this.mapArrayNumber);
      this.initPathProperties(this.mapArrayNumber);
      this.generateMap(this.mapArray);
      this.generateTerrant(this.mapArray);
      if (this.character?.position)
        this.characterCurrentPosition = this.character?.position;
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
        this.character?.position.add(vectorsMove[currentVector].vector);

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

    const startBtn = document.querySelector("#start");
    const resetBtn = document.querySelector("#reset");
    const distanceSelect = document.querySelector("#distance");
    const toggleEditBtn = document.querySelector("#edit");
    const editedBtn = document.querySelector("#edited");
    const drawBtn = document.querySelector("#draw");
    const eraserBtn = document.querySelector("#eraser");
    const startPointBtn = document.querySelector("#startPoint");
    const targetPointBtn = document.querySelector("#targetPoint");
    const weightInput = document.querySelector("#weight");

    startBtn?.addEventListener("click", () => {
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

    resetBtn?.addEventListener(
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

    distanceSelect?.addEventListener(
      "change",
      (e: any) => {
        //@ts-ignore
        this.heuristicFunction = Number(e.target.value);
      },
      false
    );

    weightInput?.addEventListener("change", (e: any) => {
      this.onChangeWeight(e);
    });

    toggleEditBtn?.addEventListener("click", () => {
      this.changeButtonColor("draw");
      this.onClickEdit();
    });

    startPointBtn?.addEventListener("click", () => {
      this.onClickChangeStartPosition();
    });

    editedBtn?.addEventListener("click", () => {
      this.onEditComplete();
    });

    drawBtn?.addEventListener("click", () => {
      this.changeButtonColor("draw");
      this.onClickEdit(true);
    });

    eraserBtn?.addEventListener("click", () => {
      this.changeButtonColor("eraser");
      this.onClickEraser();
    });

    window.addEventListener("mousemove", (e) => {
      this.pointer.x = (e.clientX / window.innerWidth) * 2 - 1;
      this.pointer.y = -(e.clientY / window.innerHeight) * 2 + 1;
    });

    window.addEventListener("mousedown", (e) => {
      this.isMouseDown = true;
    });

    window.addEventListener("mouseup", (e) => {
      this.isMouseDown = false;
    });
  }

  onChangeWeight(e: any) {
    const valueInput = Number(e.target?.value);
    if (Number.isInteger(valueInput)) {
      this.weight = valueInput;
    } else {
      e.target.value = this.weight;
    }
  }

  onClickChangeStartPosition() {
    if (this.character?.position)
      this.characterCurrentPosition = new Vector3().copy(
        this.character.position
      );
    this.editModes = {
      ...this.defaultEditModes,
      start: true,
    };
  }

  onClickEraser() {
    this.editModes = {
      ...this.defaultEditModes,
      eraser: true,
    };
  }

  onClickEdit(isChildEdit?: boolean) {
    this.control.enableDamping = false;
    // prevent glosbe when control damping make the final position wrong
    setTimeout(() => {
      if (!isChildEdit) {
        const mainControl = document.querySelector("#mainControl");
        const mainEdit = document.querySelector("#mainEdit");
        this.control.saveState();
        mainEdit?.classList.remove("translate-x-[450px]");
        mainControl?.classList.add("translate-x-[450px]");
        this.camera.position.set(0, 100, 300);
        this.generateMap(this.mapArray, true);
        this.generateTerrant(this.mapArray, true);
      }
      this.editModes = {
        ...this.defaultEditModes,
        draw: true,
      };
    }, 100);
  }

  onEditComplete() {
    const mainControl = document.querySelector("#mainControl");
    const mainEdit = document.querySelector("#mainEdit");

    this.editModes = {
      ...this.defaultEditModes,
    };
    this.control.reset();
    this.control.enableDamping = true;
    this.control.enabled = true;
    mainEdit?.classList.add("translate-x-[450px]");
    mainControl?.classList.remove("translate-x-[450px]");

    Object.keys(this.wallsPosition).forEach((item, index) => {
      const indexArray = item.split("+");
      this.mapArrayNumber[indexArray[1]][indexArray[0]] = 1;
    });

    this.mapArrayNumber = this.mapArrayNumber.map((row, rowIndex) =>
      row.map((col, colIndex) => {
        const isObject = col === TARGET_CODE || col === PLAYER_CODE;
        let returnNumber = isObject ? col : GROUND_CODE;
        const nameNumberBlock = `${colIndex}+${rowIndex}`;

        if (nameNumberBlock in this.wallsPosition && !isObject) {
          returnNumber = WALL_CODE;
        }

        return returnNumber;
      })
    );

    const mapSelected = this[`mapArrayNumber`];
    this.initMapArray(mapSelected);
    this.initPathProperties(mapSelected);
    this.generateMap(this.mapArray);
    this.generateTerrant(this.mapArray);
  }

  changeButtonColor(action: string) {
    const buttonsIdArray = ["draw", "eraser", "startPoint", "targetPoint"];

    buttonsIdArray.forEach((item) => {
      document.querySelector(`#${item}`)?.classList.remove("bg-[#FAEAB1]");
      document.querySelector(`#${item}`)?.classList.add("bg-transparent");
    });

    document.querySelector(`#${action}`)?.classList.remove("bg-transparent");
    document.querySelector(`#${action}`)?.classList.add("bg-[#FAEAB1]");
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
        if (col === PLAYER_CODE) {
          playerPos = [rowIndex, colIndex];
        } else if (col === TARGET_CODE) {
          targetPos = [rowIndex, colIndex];
        }
      });
    });
    this.playerNode.position = playerPos;
    this.targetNode.position = targetPos;
  }

  generateMap(mapArray: nodeTypeRecursive[][], isEdit?: boolean) {
    this.scene.remove(this.ground);
    this.ground = new THREE.Group();

    const planeWidth = MINI_PLANE_GROUND_WIDTH;
    const planeSpace = 1;
    const mapWidth = mapArray[0].length * planeWidth * planeSpace;
    const mapHeight = mapArray.length * planeWidth * planeSpace;

    mapArray.forEach((row: any, indexRow: number) => {
      row.forEach((item: any, indexItem: number) => {
        const groundBlockMaterial = new THREE.MeshStandardMaterial({
          color: 0x285430,
          transparent: true,
        });
        let groundBlock;
        let groundBlockPosY = 0;

        if (isEdit) {
          groundBlock = new THREE.Mesh(
            new THREE.PlaneGeometry(planeWidth, planeWidth),
            groundBlockMaterial
          );
          groundBlockPosY = 2;
          groundBlock.material.opacity = item.code === WALL_CODE ? 0.5 : 1;
          groundBlock.rotation.set(-Math.PI / 2, 0, 0);
        } else {
          groundBlock = new THREE.Mesh(
            new THREE.BoxGeometry(planeWidth, planeWidth, planeWidth),
            groundBlockMaterial
          );

          groundBlock.material.opacity = 1;
        }

        groundBlock.position.set(
          planeWidth * (indexItem * planeSpace),
          groundBlockPosY,
          planeWidth * (indexRow * planeSpace)
        );
        groundBlock.name = `${indexItem}+${indexRow}`;
        groundBlock.receiveShadow = true;
        this.ground.add(groundBlock);
      });
    });

    this.ground.position.set(-(mapWidth / 2), 0, -(mapHeight / 2));

    this.scene.add(this.ground);
  }

  generateTerrant(mapArray: nodeTypeRecursive[][], isEdit?: boolean) {
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
              if (!isEdit) {
                const randomNumber = Math.ceil(Math.random() * 3);
                blockClone = this.objects[`rock${randomNumber}`]?.scene.clone();
              } else {
                blockClone = null;
              }
            }
            break;
          case 2:
            {
              blockClone = this.character;
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
      f: code == PLAYER_CODE ? 0 : Number.MAX_SAFE_INTEGER,
      g: code == PLAYER_CODE ? 0 : Number.MAX_SAFE_INTEGER,
      code,
      position: code == TARGET_CODE ? [0, 1] : [0, 0],
      prevNode: null,
    };

    return node;
  }

  update() {
    const { draw, eraser, start, target } = this.editModes;

    if (draw || eraser || start || target) {
      this.camera.position.lerp(new Vector3(0, 300, 0), 0.07);
      this.camera.lookAt(0, 0, 0);
      this.control.enabled = false;
    }

    if (draw || eraser) {
      this.character?.position.set(
        this.characterCurrentPosition.x,
        this.characterCurrentPosition.y,
        this.characterCurrentPosition.z
      );
      this.raycaster.setFromCamera(this.pointer, this.camera);

      const intersects = this.raycaster.intersectObjects(this.ground.children);

      // reset opacity for prev assign block
      if (this.prevIntersect) {
        this.prevIntersect.material.opacity = 1;
      }

      const intersectObjName = intersects[0]?.object.name;
      const intersectObj = this.ground.getObjectByName(intersectObjName) as any;

      // looks suck
      if (intersectObj) {
        const isWall = intersectObjName in this.wallsPosition;
        if (this.isMouseDown) {
          if (!isWall && draw) {
            this.wallsPosition[intersectObjName] = 1;
          } else if (isWall && eraser) {
            delete this.wallsPosition[intersectObjName];
          }

          if (eraser) {
            this.prevIntersect = intersectObj;
          } else if (draw) {
            this.prevIntersect = null;
          }
        } else {
          if (!isWall) {
            this.prevIntersect = intersectObj;
          }
        }

        intersectObj.material.opacity = 0.5;
      }
    }

    if (start) {
      this.raycaster.setFromCamera(this.pointer, this.camera);
      const intersects = this.raycaster.intersectObjects(this.ground.children);
      const differentCoordinate = 40;
      console.log(this.playerNode);
      if (intersects[0]) {
        this.character?.position.set(
          intersects[0].point.x + differentCoordinate,
          0,
          intersects[0].point.z + differentCoordinate
        );
      }
    }
  }
}

export default MapRender;
