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
    // Convert mouse coordinates to normalized device coordinates (-1 to +1)
    const rect = canvas.getBoundingClientRect();
    const ndcX = ((mouseX - rect.left) / rect.width) * 2 - 1;
    const ndcY = -((mouseY - rect.top) / rect.height) * 2 + 1;

    // Set up a raycaster from the camera through the mouse position
    const raycaster = new THREE.Raycaster();
    raycaster.setFromCamera(new Vector2(ndcX, ndcY), camera);

    // Define the XZ plane (y=0)
    const plane = new THREE.Plane(new THREE.Vector3(0, 1, 0), 0);

    // Get intersection point with the plane
    const intersection = new THREE.Vector3();
    raycaster.ray.intersectPlane(plane, intersection);

    const tidiedIntersection = intersection.clone();

    // Round the intersection coordinates to avoid floating point precision issues
    tidiedIntersection.x = clamp(Math.round(tidiedIntersection.x * 100) / 100, -2.5, 2.5);
    tidiedIntersection.z = clamp(Math.round(tidiedIntersection.z * 100) / 100, -2.5, 2.5);
    tidiedIntersection.y = 0; // Ensure y is set to 0 for the XZ plane

    return tidiedIntersection;
}

export function worldPositionToMousePosition(
    worldPosition: THREE.Vector3,
    canvas: HTMLCanvasElement,
    camera: THREE.PerspectiveCamera
): { x: number; y: number } {
    // Project the world position to normalized device coordinates
    const vector = worldPosition.project(camera);

    // Convert normalized device coordinates to screen coordinates
    const rect = canvas.getBoundingClientRect();
    const x = (vector.x * 0.5 + 0.5) * rect.width + rect.left;
    const y = -(vector.y * 0.5 - 0.5) * rect.height + rect.top;

    return {x, y};
}

export function clamp(value: number, min: number, max: number): number {
    return Math.max(min, Math.min(max, value));
}

export function normalize(val: number, min: number, max: number): number {
    // Shift to positive to avoid issues when crossing the 0 line
    if (min < 0) {
        max += 0 - min;
        val += 0 - min;
        min = 0;
    }
    // Shift values from 0 - max
    val = val - min;
    max = max - min;
    return Math.max(0, Math.min(1, val / max));
}