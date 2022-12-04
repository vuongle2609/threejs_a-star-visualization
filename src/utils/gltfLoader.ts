import { GLTFLoader } from "three/examples/jsm/loaders/GLTFLoader";

const modelGLTFLoader = async (path: string | string[]) => {
  const loader = new GLTFLoader();
  if (typeof path === "string") {
    const gltfModel = await loader.loadAsync(path);

    return gltfModel;
  } else {
    return Promise.all(
      path.map(async (item) => {
        return await loader.loadAsync(item);
      })
    );
  }
};

export default modelGLTFLoader;
