import { Color } from "three";
import { nodeTypeRecursive } from "../../types";

class a_star {
  playerNode: nodeTypeRecursive;
  targetNode: nodeTypeRecursive;
  groundGroup: THREE.Group;
  mapArray: nodeTypeRecursive[][];
  timeout: number | undefined;
  heuristicFunction: 1 | 2 | 3;
  weight: number;

  max = Math.max;
  abs = Math.abs;
  pow = Math.pow;
  sqrt = Math.sqrt;

  constructor(
    playerNode: nodeTypeRecursive,
    targetNode: nodeTypeRecursive,
    groundGroup: THREE.Group,
    mapArray: nodeTypeRecursive[][],
    timeout?: number,
    heuristicFunction?: 1 | 2 | 3,
    weight?: number
  ) {
    this.playerNode = playerNode;
    this.targetNode = targetNode;
    this.groundGroup = groundGroup;
    this.mapArray = mapArray;
    this.timeout = timeout || undefined;
    this.heuristicFunction = heuristicFunction || 1;
    this.weight = weight || 2;
  }

  findPath() {
    this.playerNode.f =
      0 +
      this.findDistance(
        this.heuristicFunction,
        this.playerNode.position[1],
        this.playerNode.position[0],
        this.targetNode.position[1],
        this.targetNode.position[0]
      );

    const open = [this.playerNode];

    if (this.timeout === undefined) {
      while (open.length !== 0) {
        this.aStarFunction(open);
      }
    } else {
      const findPathInterval = setInterval(() => {
        if (open.length !== 0) {
          this.aStarFunction(open, () => clearInterval(findPathInterval));
        }
      }, this.timeout);
    }
  }

  aStarFunction(open: nodeTypeRecursive[], callback?: () => void) {
    const next = open[0];

    if (next.code !== 3) {
      this.colorNode(next.position[1], next.position[0], 0x874c62);
    }

    open.shift();

    if (
      next.position[0] === this.targetNode.position[0] &&
      next.position[1] === this.targetNode.position[1]
    ) {
      console.log("end a*");

      let nodePath = next.prevNode;

      let pathCount = 0;

      const colorPath = () => {
        if (nodePath) {
          this.colorNode(nodePath.position[1], nodePath.position[0], 0xf4bfbf);
          pathCount += 1;
          nodePath = nodePath.prevNode;
        }
      };

      if (this.timeout === undefined) {
        while (nodePath) {
          colorPath();
        }
      } else {
        const intervalColorPath = setInterval(() => {
          if (nodePath) {
            colorPath();
          } else {
            clearInterval(intervalColorPath);
          }
        }, this.timeout);
      }

      console.log(pathCount);
      callback?.();
      return;
    }

    this.findNeighbors(next.position[0], next.position[1]).forEach(
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
            this.findDistance(
              this.heuristicFunction,
              next.position[1],
              next.position[0],
              neighbour.x,
              neighbour.y
            );

          if (neighbourTemp.g && newG < neighbourTemp.g) {
            const { x, y } = neighbour;
            neighbourTemp.position = [y, x];

            neighbourTemp.g = newG;
            neighbourTemp.f =
              newG +
              this.weight *
                this.findDistance(
                  this.heuristicFunction,
                  x,
                  y,
                  this.targetNode.position[1],
                  this.targetNode.position[0]
                );

            if (!open.some((e) => e.position[1] === x && e.position[0] === y)) {
              neighbourTemp.prevNode = next;
              open.push(neighbourTemp);
              open.sort((a, b) => a.f - b.f);
            }
          }
        }
      }
    );
  }

  colorNode(x: number, y: number, color: number) {
    (this.groundGroup.getObjectByName(`${y}+${x}`) as any)?.material.color.set(
      new Color(color)
    );
  }

  findDistance(
    type: 1 | 2 | 3,
    x1: number,
    y1: number,
    x2: number,
    y2: number
  ) {
    switch (type) {
      case 1:
        return this.max(this.abs(x1 - x2), this.abs(y1 - y2));
      case 2:
        return this.abs(x1 - x2) + this.abs(y1 - y2);
      case 3:
        return this.sqrt(this.pow(x1 - x2, 2) + this.pow(y1 - y2, 2));
      default:
        return 0;
    }
  }

  findNeighbors(y: number, x: number) {
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
  }
}

export default a_star;
