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

    // Create multiple cubes spawning from center
    const cubeCount = 25;
    const cubes = [];

    for (let i = 0; i < cubeCount; i++) {
      // Create cube mesh
      const cube = new THREE.Mesh(cubeGeometry, cubeMaterial.clone());

      // Create wireframe edges
      const edges = new THREE.LineSegments(edgesGeometry, edgesMaterial.clone());
      cube.add(edges);

      // Start at center
      cube.position.set(0, 0, 0);

      // Random rotation
      cube.rotation.x = Math.random() * Math.PI * 2;
      cube.rotation.y = Math.random() * Math.PI * 2;
      cube.rotation.z = Math.random() * Math.PI * 2;

      // Random scale
      const scale = Math.random() * 1.5 + 0.5;
      cube.scale.set(scale, scale, scale);

      // Generate random direction vector (normalized)
      const phi = Math.random() * Math.PI * 2; // Angle around Y axis
      const theta = Math.acos((Math.random() * 2) - 1); // Angle from Y axis

      const directionX = Math.sin(theta) * Math.cos(phi);
      const directionY = Math.sin(theta) * Math.sin(phi);
      const directionZ = Math.cos(theta);

      // Store animation data
      cube.userData = {
        rotationSpeed: {
          x: (Math.random() - 0.5) * 0.02,
          y: (Math.random() - 0.5) * 0.02,
          z: (Math.random() - 0.5) * 0.02
        },
        direction: {
          x: directionX,
          y: directionY,
          z: directionZ
        },
        speed: Math.random() * 0.3 + 0.15, // Random speed between 0.15 and 0.45
        maxDistance: 50 + Math.random() * 30, // Distance before respawning (50-80)
        age: Math.random() * 200, // Start at random age for staggered spawning
        fadeStart: 40, // Start fading at this distance
        initialOpacity: 0.6
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

        // Increment age
        cube.userData.age += cube.userData.speed;

        // Move cube outward from center
        cube.position.x = cube.userData.direction.x * cube.userData.age;
        cube.position.y = cube.userData.direction.y * cube.userData.age;
        cube.position.z = cube.userData.direction.z * cube.userData.age;

        // Calculate distance from center
        const distanceFromCenter = Math.sqrt(
          cube.position.x * cube.position.x +
          cube.position.y * cube.position.y +
          cube.position.z * cube.position.z
        );

        // Fade out as cube gets farther
        if (distanceFromCenter > cube.userData.fadeStart) {
          const fadeProgress = (distanceFromCenter - cube.userData.fadeStart) /
                               (cube.userData.maxDistance - cube.userData.fadeStart);
          cube.material.opacity = cube.userData.initialOpacity * (1 - fadeProgress);

          // Also fade the edges
          if (cube.children[0]) {
            cube.children[0].material.opacity = 0.8 * (1 - fadeProgress);
          }
        } else {
          cube.material.opacity = cube.userData.initialOpacity;
          if (cube.children[0]) {
            cube.children[0].material.opacity = 0.8;
          }
        }

        // Respawn cube at center when it reaches max distance
        if (distanceFromCenter >= cube.userData.maxDistance) {
          // Reset position to center
          cube.userData.age = 0;

          // Generate new random direction
          const phi = Math.random() * Math.PI * 2;
          const theta = Math.acos((Math.random() * 2) - 1);

          cube.userData.direction.x = Math.sin(theta) * Math.cos(phi);
          cube.userData.direction.y = Math.sin(theta) * Math.sin(phi);
          cube.userData.direction.z = Math.cos(theta);

          // Randomize speed again
          cube.userData.speed = Math.random() * 0.3 + 0.15;
          cube.userData.maxDistance = 50 + Math.random() * 30;

          // Reset opacity
          cube.material.opacity = cube.userData.initialOpacity;
          if (cube.children[0]) {
            cube.children[0].material.opacity = 0.8;
          }
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
