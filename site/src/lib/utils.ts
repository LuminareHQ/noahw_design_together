import * as THREE from "three";
import {Vector2} from "three";

export const toCommand = (segments: string[]) => {
    let internal: string[] = [];
    internal.push("CM");
    internal = [...internal, ...segments];
    return internal.join("|");
};

export const identToIcon = (identity: string): string => {
    let icon_string = "mdi:"

    switch (identity) {
        case "Mouse":
            icon_string += "rodent";
            break;
        default:
            icon_string += identity.toLowerCase();
            break;
    }

    return icon_string;
};


export function mousePositionToWorldPosition(
    mouseX: number,
    mouseY: number,
    canvas: HTMLCanvasElement,
    camera: THREE.PerspectiveCamera
): THREE.Vector3 {
    const rect = canvas.getBoundingClientRect();
    const ndcX = ((mouseX - rect.left) / rect.width) * 2 - 1;
    const ndcY = -((mouseY - rect.top) / rect.height) * 2 + 1;

    const raycaster = new THREE.Raycaster();
    raycaster.setFromCamera(new Vector2(ndcX, ndcY), camera);

    const plane = new THREE.Plane(new THREE.Vector3(0, 1, 0), 0);

    const intersection = new THREE.Vector3();
    raycaster.ray.intersectPlane(plane, intersection);

    const tidiedIntersection = intersection.clone();

    // Avoid floating point issues and reduce network command sizes
    tidiedIntersection.x = clamp(Math.round(tidiedIntersection.x * 100) / 100, -2.5, 2.5);
    tidiedIntersection.z = clamp(Math.round(tidiedIntersection.z * 100) / 100, -2.5, 2.5);
    tidiedIntersection.y = 0;

    return tidiedIntersection;
}

export function worldPositionToMousePosition(
    worldPosition: THREE.Vector3,
    canvas: HTMLCanvasElement,
    camera: THREE.PerspectiveCamera
): { x: number; y: number } {
    const vector = worldPosition.project(camera);

    const rect = canvas.getBoundingClientRect();
    const x = (vector.x * 0.5 + 0.5) * rect.width + rect.left;
    const y = -(vector.y * 0.5 - 0.5) * rect.height + rect.top;

    return {x, y};
}

export function clamp(value: number, min: number, max: number): number {
    return Math.max(min, Math.min(max, value));
}

export function normalize(val: number, min: number, max: number): number {
    if (min < 0) {
        max += 0 - min;
        val += 0 - min;
        min = 0;
    }
    val = val - min;
    max = max - min;
    return Math.max(0, Math.min(1, val / max));
}