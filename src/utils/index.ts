import * as THREE from "three";

export const getModelSize = (object: any) => {
  const box = new THREE.Box3().setFromObject(object);
  const size = box.getSize(new THREE.Vector3());

  return size;
};
