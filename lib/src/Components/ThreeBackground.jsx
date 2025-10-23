import React, { useEffect, useRef } from 'react';
import * as THREE from 'three';
import './ThreeBackground.css';

const ThreeBackground = () => {
  const containerRef = useRef(null);
  const sceneRef = useRef(null);
  const cameraRef = useRef(null);
  const rendererRef = useRef(null);
  const cubesRef = useRef([]);
  const mouseRef = useRef({ x: 0, y: 0 });
  const targetMouseRef = useRef({ x: 0, y: 0 });

  useEffect(() => {
    if (!containerRef.current) return;

    // Scene setup
    const scene = new THREE.Scene();
    scene.fog = new THREE.Fog(0x0f172a, 1, 100);
    sceneRef.current = scene;

    // Camera setup
    const camera = new THREE.PerspectiveCamera(
      75,
      window.innerWidth / window.innerHeight,
      0.1,
      1000
    );
    camera.position.z = 30;
    cameraRef.current = camera;

    // Renderer setup
    const renderer = new THREE.WebGLRenderer({
      antialias: true,
      alpha: true
    });
    renderer.setSize(window.innerWidth, window.innerHeight);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    renderer.setClearColor(0x0f172a, 1);
    containerRef.current.appendChild(renderer.domElement);
    rendererRef.current = renderer;

    // Create floating cubes
    const cubeGeometry = new THREE.BoxGeometry(1, 1, 1);
    const edgesGeometry = new THREE.EdgesGeometry(cubeGeometry);

    // Material matching register page colors
    const cubeMaterial = new THREE.MeshPhongMaterial({
      color: 0x3b82f6, // Blue from register page
      transparent: true,
      opacity: 0.6,
      shininess: 100
    });

    const edgesMaterial = new THREE.LineBasicMaterial({
      color: 0x60a5fa, // Lighter blue
      transparent: true,
      opacity: 0.8
    });

    // Create multiple cubes with random positions
    const cubeCount = 25;
    const cubes = [];

    for (let i = 0; i < cubeCount; i++) {
      // Create cube mesh
      const cube = new THREE.Mesh(cubeGeometry, cubeMaterial.clone());

      // Create wireframe edges
      const edges = new THREE.LineSegments(edgesGeometry, edgesMaterial.clone());
      cube.add(edges);

      // Random position
      cube.position.x = (Math.random() - 0.5) * 60;
      cube.position.y = (Math.random() - 0.5) * 60;
      cube.position.z = (Math.random() - 0.5) * 60;

      // Random rotation
      cube.rotation.x = Math.random() * Math.PI;
      cube.rotation.y = Math.random() * Math.PI;

      // Random scale
      const scale = Math.random() * 1.5 + 0.5;
      cube.scale.set(scale, scale, scale);

      // Store animation data
      cube.userData = {
        rotationSpeed: {
          x: (Math.random() - 0.5) * 0.01,
          y: (Math.random() - 0.5) * 0.01,
          z: (Math.random() - 0.5) * 0.01
        },
        floatSpeed: Math.random() * 0.5 + 0.2,
        floatOffset: Math.random() * Math.PI * 2,
        originalPosition: {
          x: cube.position.x,
          y: cube.position.y,
          z: cube.position.z
        }
      };

      scene.add(cube);
      cubes.push(cube);
    }

    cubesRef.current = cubes;

    // Lighting
    const ambientLight = new THREE.AmbientLight(0x3b82f6, 0.5);
    scene.add(ambientLight);

    const directionalLight1 = new THREE.DirectionalLight(0x60a5fa, 0.8);
    directionalLight1.position.set(5, 5, 5);
    scene.add(directionalLight1);

    const directionalLight2 = new THREE.DirectionalLight(0x93c5fd, 0.5);
    directionalLight2.position.set(-5, -5, -5);
    scene.add(directionalLight2);

    // Mouse move handler
    const handleMouseMove = (event) => {
      targetMouseRef.current.x = (event.clientX / window.innerWidth) * 2 - 1;
      targetMouseRef.current.y = -(event.clientY / window.innerHeight) * 2 + 1;
    };

    // Touch move handler
    const handleTouchMove = (event) => {
      if (event.touches.length > 0) {
        targetMouseRef.current.x = (event.touches[0].clientX / window.innerWidth) * 2 - 1;
        targetMouseRef.current.y = -(event.touches[0].clientY / window.innerHeight) * 2 + 1;
      }
    };

    // Handle window resize
    const handleResize = () => {
      camera.aspect = window.innerWidth / window.innerHeight;
      camera.updateProjectionMatrix();
      renderer.setSize(window.innerWidth, window.innerHeight);
    };

    window.addEventListener('mousemove', handleMouseMove);
    window.addEventListener('touchmove', handleTouchMove);
    window.addEventListener('resize', handleResize);

    // Animation loop
    let animationId;
    const clock = new THREE.Clock();

    const animate = () => {
      animationId = requestAnimationFrame(animate);
      const elapsedTime = clock.getElapsedTime();

      // Smooth mouse following
      mouseRef.current.x += (targetMouseRef.current.x - mouseRef.current.x) * 0.05;
      mouseRef.current.y += (targetMouseRef.current.y - mouseRef.current.y) * 0.05;

      // Camera movement based on mouse
      camera.position.x = mouseRef.current.x * 5;
      camera.position.y = mouseRef.current.y * 5;
      camera.lookAt(scene.position);

      // Animate cubes
      cubes.forEach((cube, index) => {
        // Rotation
        cube.rotation.x += cube.userData.rotationSpeed.x;
        cube.rotation.y += cube.userData.rotationSpeed.y;
        cube.rotation.z += cube.userData.rotationSpeed.z;

        // Floating animation
        const floatOffset = cube.userData.floatOffset;
        const floatSpeed = cube.userData.floatSpeed;

        cube.position.y = cube.userData.originalPosition.y +
          Math.sin(elapsedTime * floatSpeed + floatOffset) * 2;

        // React to mouse position
        const distance = Math.sqrt(
          Math.pow(cube.position.x - mouseRef.current.x * 10, 2) +
          Math.pow(cube.position.y - mouseRef.current.y * 10, 2)
        );

        if (distance < 15) {
          const force = (15 - distance) / 15;
          cube.position.x += (cube.position.x - mouseRef.current.x * 10) * force * 0.1;
          cube.position.z += force * 2;

          // Glow effect when near mouse
          cube.material.opacity = 0.6 + force * 0.4;
        } else {
          // Return to original z position
          cube.position.z += (cube.userData.originalPosition.z - cube.position.z) * 0.02;
          cube.material.opacity = 0.6;
        }
      });

      renderer.render(scene, camera);
    };

    animate();

    // Cleanup
    return () => {
      cancelAnimationFrame(animationId);
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('touchmove', handleTouchMove);
      window.removeEventListener('resize', handleResize);

      cubes.forEach(cube => {
        cube.geometry.dispose();
        cube.material.dispose();
        if (cube.children[0]) {
          cube.children[0].geometry.dispose();
          cube.children[0].material.dispose();
        }
      });

      renderer.dispose();
      if (containerRef.current && renderer.domElement) {
        containerRef.current.removeChild(renderer.domElement);
      }
    };
  }, []);

  return <div ref={containerRef} className="three-background" />;
};

export default ThreeBackground;
