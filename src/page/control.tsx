import { useEffect, useRef } from "react";
import { useFrame, useThree } from "@react-three/fiber";
import { OrbitControls, PointerLockControls } from "@react-three/drei";
import * as THREE from "three";
export const Controls = () => {
  const { camera } = useThree();
  const isMobile = /Android|iPhone|iPad|iPod/i.test(navigator.userAgent);

  const keys = useRef<Record<string, boolean>>({
    KeyW: false,
    KeyA: false,
    KeyS: false,
    KeyD: false,
    Space: false,
    ShiftLeft: false,
    ShiftRight: false,
  });

  useEffect(() => {
    if (isMobile) return;

    const down = (e: KeyboardEvent) => {
      if (e.code in keys.current) keys.current[e.code] = true;
    };
    const up = (e: KeyboardEvent) => {
      if (e.code in keys.current) keys.current[e.code] = false;
    };
    window.addEventListener("keydown", down);
    window.addEventListener("keyup", up);
    return () => {
      window.removeEventListener("keydown", down);
      window.removeEventListener("keyup", up);
    };
  }, [isMobile]);
  useFrame((_, delta) => {
    if (isMobile) return;
    const speed = 3;
    const move = new THREE.Vector3();

    /* camera‑local forward vector (y projected out) */
    const forward = new THREE.Vector3();
    camera.getWorldDirection(forward);
    forward.y = 0;
    forward.normalize();

    /* camera‑local right vector — rotate forward 90° around Y */
    const right = new THREE.Vector3(-forward.z, 0, forward.x);

    const k = keys.current;

    if (k.KeyW) move.add(forward);
    if (k.KeyS) move.sub(forward);
    if (k.KeyD) move.add(right); // guaranteed right
    if (k.KeyA) move.sub(right); // guaranteed left
    if (k.Space) move.y += 1;
    if (k.ShiftLeft || k.ShiftRight) move.y -= 1;

    if (move.lengthSq() !== 0) {
      move.normalize().multiplyScalar(speed * delta);
      camera.position.add(move);
    }
  });

  return isMobile ? (
    <OrbitControls
      enablePan={false}
      enableRotate
      enableZoom
      zoomSpeed={0.8}
      rotateSpeed={0.4}
      maxDistance={20}
      minDistance={2}
    />
  ) : (
    <PointerLockControls />
  );
};
