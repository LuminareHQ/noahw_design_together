import {mousePositionCanvas, mousePositionWorld, experienceTime, sceneLoaded} from "$lib/state.svelte";
import {GLTFLoader} from "three/addons/loaders/GLTFLoader.js";
import {MapControls} from 'three/addons/controls/MapControls.js';
import {normalize, mousePositionToWorldPosition, clamp} from "$lib/utils";
import {get} from "svelte/store";
import * as THREE from "three";
import {DEG2RAD, lerp} from "three/src/math/MathUtils.js";
import {EffectComposer} from 'three/addons/postprocessing/EffectComposer.js';
import {RenderPass} from 'three/addons/postprocessing/RenderPass.js';
import {OutputPass} from 'three/addons/postprocessing/OutputPass.js';
import {UnrealBloomPass} from "three/addons/postprocessing/UnrealBloomPass.js";
import {OrbitControls} from "three/addons/controls/OrbitControls.js";


export default class Experience {
    #canvas: HTMLCanvasElement;
    get canvas(): HTMLCanvasElement {
        return this.#canvas;
    }

    #renderer: THREE.WebGLRenderer;
    #composer: EffectComposer;

    #scene: THREE.Scene;
    #camera: THREE.PerspectiveCamera;
    get camera(): THREE.PerspectiveCamera {
        return this.#camera;
    }

    #controls: MapControls;

    constructor(canvas: HTMLCanvasElement) {
        this.#canvas = canvas;

        this.#scene = new THREE.Scene();
        this.#camera = new THREE.PerspectiveCamera(65, canvas.clientWidth / canvas.clientHeight, 0.1, 1000);

        this.#scene.background = new THREE.Color(0x0f172a);

        let initX = lerp(2, 1.63, normalize(clamp(this.#canvas.clientWidth, 700, 1490), 700, 1490));
        let initZ = lerp(0, 1.45, normalize(clamp(this.#canvas.clientWidth, 700, 1490), 700, 1490));
        this.#camera.position.set(initX, 0.5, initZ);

        this.#controls = new OrbitControls(this.#camera, this.#canvas);
        this.#controls.enableDamping = true;
        this.#controls.dampingFactor = 0.025;
        this.#controls.minPolarAngle = 0.85;
        this.#controls.maxPolarAngle = Math.PI / 2.5; // radians
        this.#controls.enablePan = false;
        this.#controls.zoomSpeed = 1;
        this.#controls.zoomToCursor = false;
        this.#controls.minDistance = 1.0;
        this.#controls.maxDistance = 2.25;

        this.#controls.mouseButtons = {
            LEFT: THREE.MOUSE.ROTATE,
            MIDDLE: THREE.MOUSE.DOLLY,
            RIGHT: THREE.MOUSE.ROTATE,
        }
        this.#controls.touches = {
            ONE: THREE.TOUCH.ROTATE,
            TWO: THREE.TOUCH.DOLLY_ROTATE,
        }

        this.#renderer = new THREE.WebGLRenderer({canvas, antialias: true, stencil: true});
        this.#renderer.setSize(canvas.clientWidth, canvas.clientHeight);

        this.#composer = new EffectComposer(this.#renderer);

        this.#compose();

        this.#renderer.setAnimationLoop(this.#animate.bind(this));

        return this;
    }

    #compose() {
        this.#scene.background = new THREE.Color(0x121212);

        const modelLoader = new GLTFLoader();

        modelLoader.load(
            "/sushi/SushiBlend.glb",
            (model) => {
                let sceneGroup = new THREE.Group();
                sceneGroup.add(model.scene)
                sceneGroup.position.set(0, -1.1, 0);
                sceneGroup.scale.set(2, 2, 2);
                this.#scene.add(sceneGroup);
                sceneLoaded.set(true);
                console.log("Sushi model loaded successfully");
            }
        )

        const renderPass = new RenderPass(this.#scene, this.#camera);
        this.#composer.addPass(renderPass);

        const bloomPass = new UnrealBloomPass(new THREE.Vector2(this.#canvas.width, this.#canvas.height), 0.15, 0.25, 1.0);
        this.#composer.addPass(bloomPass);

        const outputPass = new OutputPass();
        this.#composer.addPass(outputPass);
    }

    #animate() {
        this.#controls.update()

        let cursor = get(mousePositionCanvas);
        mousePositionWorld.set(mousePositionToWorldPosition(cursor.x, cursor.y, this.#canvas, this.#camera));

        experienceTime.set(performance.now());

        this.#camera.rotateX(((normalize(this.#controls.getDistance(), 1.0, 2.0) * 45) - 45) * DEG2RAD);

        this.#render()
    }

    #render() {
        // this.#renderer.render(this.#scene, this.#camera);

        this.#composer.setSize(this.#canvas.width, this.#canvas.height);

        this.#composer.render();
    }

    setSize(width: number, height: number) {
        this.#renderer.setSize(width, height);
        this.#camera.aspect = width / height;
        this.#camera.updateProjectionMatrix();
    }

    setIdleState(isIdle: boolean) {
        this.#controls.autoRotate = isIdle;
        if (isIdle) {
            this.#controls.autoRotateSpeed = 0.2;
        } else {
            this.#controls.autoRotateSpeed = 0;
        }
    }

}
