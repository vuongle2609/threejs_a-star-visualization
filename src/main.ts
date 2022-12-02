import "./style.css";
import * as THREE from "three";
import { OrbitControls } from "three/examples/jsm/controls/OrbitControls";
import { Color, Vector3 } from "three";
import { MINI_PLANE_GROUND_WIDTH } from "./constants";

class Three {
  renderer: THREE.WebGLRenderer;
  scene: THREE.Scene;
  camera: THREE.PerspectiveCamera;
  control: OrbitControls;
  ground: THREE.Group;

  node = {
    f: null,
    g: null,
    code: 0,
  };
  wallNode = {
    code: 1,
  };
  mapArrayNumber1 = [
    [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
    [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
    [0, 0, 0, 0, 0, 1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
    [0, 0, 0, 0, 0, 0, 1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
    [0, 0, 0, 0, 0, 0, 0, 1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
    [0, 0, 0, 0, 0, 0, 0, 0, 1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
    [0, 0, 0, 0, 0, 0, 0, 0, 1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
    [0, 0, 0, 0, 0, 0, 0, 0, 1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
    [0, 0, 0, 0, 0, 0, 0, 0, 1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
    [0, 0, 0, 0, 0, 0, 0, 0, 1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
    [0, 0, 0, 0, 0, 0, 0, 0, 1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
    [0, 2, 0, 0, 0, 0, 0, 0, 1, 0, 0, 0, 0, 0, 0, 0, 0, 3, 0, 0],
    [0, 0, 0, 0, 0, 0, 0, 0, 1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
    [0, 0, 0, 0, 0, 0, 0, 1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
    [0, 0, 0, 0, 0, 0, 1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
    [0, 0, 0, 0, 0, 0, 1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
    [0, 0, 0, 0, 0, 1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
    [0, 0, 0, 0, 0, 1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
    [0, 0, 0, 0, 1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
    [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
  ];
  mapArrayNumber2 = [
    [2, 0, 1, 0, 3, 0],
    [0, 0, 0, 1, 0, 0],
    [0, 0, 1, 0, 0, 0],
    [0, 0, 0, 0, 0, 0],
  ];
  playerNode: {
    f: null | number;
    g: null | number;
    code: number;
    position: number[];
  } = {
    f: null,
    g: 0,
    code: 2,
    position: [0, 0],
  };
  targetNode = {
    code: 3,
    position: [0, 0],
  };
  mapArray: any = [];

  constructor() {
    this.initialize();
  }

  initialize() {
    this.renderer = new THREE.WebGLRenderer();
    this.renderer.setSize(window.innerWidth, window.innerHeight);
    this.renderer.shadowMap.enabled = true;

    document.body.appendChild(this.renderer.domElement);

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
      500
    );

    this.scene = new THREE.Scene();
    this.scene.background = new THREE.Color("#F5EBE0");

    this.control = new OrbitControls(this.camera, this.renderer.domElement);

    this.initPathProperties(this.mapArrayNumber1);
    this.generateMap();

    document.querySelector("#start")?.addEventListener("click", () => {
      this.findPath();
    });

    document.querySelector("#restart")?.addEventListener("click", () => {
      this.initPathProperties(this.mapArrayNumber1);
      this.generateMap();
    });

    this.camera.position.set(0, 300, 0);
    this.camera.lookAt(0, 0, 0);

    this.RAF(0);
  }

  findPath() {
    console.log("start a*");
    const findDistance = (x1: number, y1: number, x2: number, y2: number) => {
      const a = x1 - x2;
      const b = y1 - y2;
      const c = Math.sqrt(a * a + b * b);
      return c;
    };

    const getNeighbours = (y: number, x: number) => {
      const top = {
        //top
        x: x,
        y: y - 1,
      };

      const left = {
        //left
        x: x - 1,
        y,
      };

      const right = {
        //right
        x: x + 1,
        y,
      };

      const bot = {
        //bot
        x: x,
        y: y + 1,
      };
      return [
        {
          ...top,
        },
        {
          //top_right
          condition: [{ ...top }, { ...right }],
          x: x + 1,
          y: y - 1,
        },
        {
          //top_left
          condition: [{ ...top }, { ...left }],
          x: x - 1,
          y: y - 1,
        },
        {
          ...left,
        },
        {
          ...right,
        },
        {
          ...bot,
        },
        {
          //bot_right
          condition: [{ ...bot }, { ...right }],
          x: x + 1,
          y: y + 1,
        },
        {
          //bot_left
          condition: [{ ...bot }, { ...left }],
          x: x - 1,
          y: y + 1,
        },
      ];
    };

    this.playerNode.f =
      0 +
      findDistance(
        this.playerNode.position[1],
        this.playerNode.position[0],
        this.targetNode.position[1],
        this.targetNode.position[0]
      );

    const open = [this.playerNode];
    console.log(this.targetNode);

    const startFind = setInterval(() => {
      if (open.length !== 0) {
        const next = open[0];

        if (next.code !== 3) {
          this.ground
            .getObjectByName(`${next.position[0]}+${next.position[1]}`)
            //@ts-ignore
            ?.material.color.set(new Color(0x874c62));
        }

        console.log(JSON.stringify(open));
        // console.log(next);
        open.shift();

        if (
          next.position[0] === this.targetNode.position[0] &&
          next.position[1] === this.targetNode.position[1]
        ) {
          console.log("end a*");
          clearInterval(startFind);
          return;
        }

        getNeighbours(next.position[0], next.position[1]).forEach(
          (neighbour) => {
            const { x, y } = neighbour;
            const neighbourTemp = this.mapArray[y]?.[x];

            let pass = true;

            if (neighbour?.condition) {
              let count = 0;
              neighbour?.condition.forEach((item) => {
                if (this.mapArray[item.y]?.[item.x]) {
                  count += 1;
                }
              });
              if (count == 2) {
                pass = false;
              }
            }

            if (
              (neighbourTemp && neighbourTemp.code !== 1 && pass) ||
              (neighbourTemp && neighbourTemp.code === 3)
            ) {
              const newG =
                (next.g || 0) +
                findDistance(
                  next.position[1],
                  next.position[0],
                  neighbour.x,
                  neighbour.y
                );

              if (
                (neighbourTemp.g && newG < neighbourTemp.g) ||
                (neighbourTemp.f === null && neighbourTemp.g === null) ||
                neighbourTemp.code === 3
              ) {
                const { x, y } = neighbour;
                neighbourTemp.position = [y, x];

                neighbourTemp.g = newG;
                neighbourTemp.f =
                  newG +
                  findDistance(
                    x,
                    y,
                    this.targetNode.position[1],
                    this.targetNode.position[0]
                  );

                if (
                  !open.some((e) => e.position[1] === x && e.position[0] === y)
                ) {
                  open.push(neighbourTemp);
                  open.sort((a, b) => (a.f || 0) - (b.f || 0));
                }
              }
            }
          }
        );
      }
    }, 20);
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

    this.mapArray = arrayMapNumber.map((row) =>
      row.map((col) => {
        let returnNode;

        switch (col) {
          case 1:
            returnNode = { ...this.wallNode };
            break;
          case 2:
            returnNode = { ...this.playerNode };
            break;
          case 3:
            returnNode = { ...this.targetNode };
            break;
          default:
            returnNode = { ...this.node };
            break;
        }

        return returnNode;
      })
    );
  }

  generateMap() {
    this.ground = new THREE.Group();

    const planeWidth = MINI_PLANE_GROUND_WIDTH;
    const planeSpace = 1.04;
    const mapWidth = this.mapArray[0].length * planeWidth * planeSpace;
    const mapHeight = this.mapArray.length * planeWidth * planeSpace;

    this.mapArray.forEach((row: any, indexRow: number) => {
      row.forEach((item: any, indexItem: number) => {
        let color;
        let name = "";
        switch (item.code) {
          case 1:
            //wall = 1
            {
              name = "wall";
              color = 0xc7bca1;
            }
            break;
          case 2:
            //player = 2
            {
              name = "player";
              color = 0xa7d2cb;
            }
            break;
          case 3:
            //target = 3
            {
              name = "target";
              color = 0xf96666;
            }
            break;
          default:
            //ground = 0
            {
              name = `${indexRow}+${indexItem}`;
              color = 0x65647c;
            }
            break;
        }

        const plane = new THREE.Mesh(
          new THREE.PlaneGeometry(planeWidth, planeWidth),
          new THREE.MeshBasicMaterial({
            color: color,
          })
        );
        plane.name = name;
        plane.rotation.set(-Math.PI / 2, 0, 0);
        plane.position.set(
          planeWidth * (indexItem * planeSpace),
          0,
          planeWidth * (indexRow * planeSpace)
        );
        this.ground.add(plane);
      });
    });

    this.ground.position.set(-(mapWidth / 2), 0, -(mapHeight / 2));

    this.scene.add(this.ground);
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
