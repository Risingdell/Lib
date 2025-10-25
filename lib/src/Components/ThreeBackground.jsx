import React, { useEffect, useRef } from 'react';
import * as THREE from 'three';
import './ThreeBackground.css';

const ThreeBackground = () => {
  const containerRef = useRef(null);
  const sceneRef = useRef(null);
  const cameraRef = useRef(null);
  const rendererRef = useRef(null);
  const cubesRef = useRef([]);

  useEffect(() => {
    if (!containerRef.current) return;

    // === Scene setup ===
    const scene = new THREE.Scene();
    scene.fog = new THREE.Fog(0x0f172a, 1, 100);
    sceneRef.current = scene;

    // === Camera setup ===
    const camera = new THREE.PerspectiveCamera(
      75,
      window.innerWidth / window.innerHeight,
      0.1,
      1000
    );
    camera.position.z = 30;
    cameraRef.current = camera;

    // === Renderer setup ===
    const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
    renderer.setSize(window.innerWidth, window.innerHeight);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    renderer.setClearColor(0x0f172a, 1);
    containerRef.current.appendChild(renderer.domElement);
    rendererRef.current = renderer;

    // === Cubes setup ===
    const cubeGeometry = new THREE.BoxGeometry(1, 1, 1);
    const edgesGeometry = new THREE.EdgesGeometry(cubeGeometry);
    const cubes = [];

    const cubeMaterial = new THREE.MeshPhongMaterial({
      color: 0x3b82f6,
      transparent: true,
      opacity: 0.6,
      shininess: 100,
    });
    const edgesMaterial = new THREE.LineBasicMaterial({
      color: 0x60a5fa,
      transparent: true,
      opacity: 0.8,
    });

    for (let i = 0; i < 25; i++) {
      const cube = new THREE.Mesh(cubeGeometry, cubeMaterial.clone());
      const edges = new THREE.LineSegments(edgesGeometry, edgesMaterial.clone());
      cube.add(edges);

      cube.rotation.set(
        Math.random() * Math.PI * 2,
        Math.random() * Math.PI * 2,
        Math.random() * Math.PI * 2
      );

      const scale = Math.random() * 1.5 + 0.5;
      cube.scale.set(scale, scale, scale);

      const phi = Math.random() * Math.PI * 2;
      const theta = Math.acos(Math.random() * 2 - 1);
      const dir = {
        x: Math.sin(theta) * Math.cos(phi),
        y: Math.sin(theta) * Math.sin(phi),
        z: Math.cos(theta),
      };

      cube.userData = {
        rotationSpeed: {
          x: (Math.random() - 0.5) * 0.02,
          y: (Math.random() - 0.5) * 0.02,
          z: (Math.random() - 0.5) * 0.02,
        },
        direction: dir,
        speed: Math.random() * 0.3 + 0.15,
        maxDistance: 50 + Math.random() * 30,
        age: Math.random() * 200,
        fadeStart: 40,
        initialOpacity: 0.6,
      };

      scene.add(cube);
      cubes.push(cube);
    }
    cubesRef.current = cubes;

    // === Lighting ===
    scene.add(new THREE.AmbientLight(0x3b82f6, 0.5));
    const light1 = new THREE.DirectionalLight(0x60a5fa, 0.8);
    light1.position.set(5, 5, 5);
    scene.add(light1);
    const light2 = new THREE.DirectionalLight(0x93c5fd, 0.5);
    light2.position.set(-5, -5, -5);
    scene.add(light2);

    // === Animation loop ===
    const clock = new THREE.Clock();
    const animate = () => {
      requestAnimationFrame(animate);
      cubes.forEach((cube) => {
        cube.rotation.x += cube.userData.rotationSpeed.x;
        cube.rotation.y += cube.userData.rotationSpeed.y;
        cube.rotation.z += cube.userData.rotationSpeed.z;

        cube.userData.age += cube.userData.speed;
        cube.position.x = cube.userData.direction.x * cube.userData.age;
        cube.position.y = cube.userData.direction.y * cube.userData.age;
        cube.position.z = cube.userData.direction.z * cube.userData.age;

        const dist = Math.sqrt(
          cube.position.x ** 2 + cube.position.y ** 2 + cube.position.z ** 2
        );
        if (dist > cube.userData.fadeStart) {
          const fade =
            (dist - cube.userData.fadeStart) /
            (cube.userData.maxDistance - cube.userData.fadeStart);
          cube.material.opacity = cube.userData.initialOpacity * (1 - fade);
          cube.children[0].material.opacity = 0.8 * (1 - fade);
        }

        if (dist >= cube.userData.maxDistance) {
          cube.userData.age = 0;
          const phi = Math.random() * Math.PI * 2;
          const theta = Math.acos(Math.random() * 2 - 1);
          cube.userData.direction = {
            x: Math.sin(theta) * Math.cos(phi),
            y: Math.sin(theta) * Math.sin(phi),
            z: Math.cos(theta),
          };
        }
      });
      renderer.render(scene, camera);
    };
    animate();

    const onResize = () => {
      camera.aspect = window.innerWidth / window.innerHeight;
      camera.updateProjectionMatrix();
      renderer.setSize(window.innerWidth, window.innerHeight);
    };
    window.addEventListener('resize', onResize);

    return () => {
      window.removeEventListener('resize', onResize);
      renderer.dispose();
    };
  }, []);

  return <div ref={containerRef} className="three-background" />;
};

export default ThreeBackground;
