'use strict';

if (!THREE) {
    const THREE = {};
    alert('THREE is not loaded');
}

const g_scene = new THREE.Scene();
const g_camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 10000);
const g_renderer = new THREE.WebGLRenderer();
const g_controls = new THREE.OrbitControls(g_camera, g_renderer.domElement);

// must be greater than 0
const TERRAIN_HEIGHT_MOD = 0.75;

g_renderer.setSize(window.innerWidth, window.innerHeight);

document.body.appendChild(g_renderer.domElement);

function init() {
    setupCamera();
    addLights();
    addGround();
    render();
}

function addLights() {
    let ambientLight = new THREE.AmbientLight(0x444444);
    ambientLight.intensity = 0.0;
    g_scene.add(ambientLight);

    let directionalLight = new THREE.DirectionalLight(0xffffff);
    directionalLight.position.set(900, 400, 0).normalize();
    g_scene.add(directionalLight);
}

function setupCamera() {
    g_camera.position.setX(1000);
    g_camera.position.setY(240);
    g_camera.position.setZ(0);
    g_camera.lookAt(new THREE.Vector3(0, 0, 0));
}

//To get the pixels, draw the image onto a canvas. From the canvas get the Pixel (R,G,B,A)
function getTerrainPixelData()
{
    let img = document.getElementById("landscape-image");
    let canvas = document.getElementById("canvas");

    if (img.width !== img.height) {
        alert('Terrain hightmap requires equal width and heights!\nCurrent width x height is ' + img.width + " x " + img.height);
        console.error('Terrain hightmap requires equal width and heights!\nCurrent width x height is ' + img.width + " x " + img.height)
    }

    canvas.width = img.width;
    canvas.height = img.height;
    canvas.getContext('2d').drawImage(img, 0, 0, img.width, img.height);

    let data = canvas.getContext('2d').getImageData(0, 0, img.height, img.width).data;
    let normPixels = []

    for (let i = 0, n = data.length; i < n; i += 4) {
        // get the average value of R, G and B.
        normPixels.push((data[i] + data[i + 1] + data[i + 2]) / 3);
    }

    let terrain = {
        data: normPixels,
        width: img.width
    };

    return terrain;
}

function addGround() {
    let terrain = getTerrainPixelData();
    
    // always 1 less than image width and image width always equals height
    let numSegments = terrain.width - 1;
    
    // keep in mind, that the plane has more vertices than segments. If there's one segment, there's two vertices, if
    // there's 10 segments, there's 11 vertices, and so forth. 
    // The simplest is, if like here you have 100 segments, the image to have 101 pixels. You don't have to worry about
    // "skewing the landscape" then..

    // to check uncomment the next line, numbers should be equal
    // console.log("length: " + terrain.length + ", vertices length: " + geometry.vertices.length);

    let geometry = new THREE.PlaneGeometry(2400, 2400, numSegments, numSegments);
    let material = new THREE.MeshLambertMaterial({
        color: 0xccccff,
        wireframe: false
    });

    for (let i = 0, l = geometry.vertices.length; i < l; i++)
    {
        geometry.vertices[i].z += terrain.data[i] * TERRAIN_HEIGHT_MOD;
    }

    geometry.computeFaceNormals();
    geometry.computeVertexNormals();

    let plane = new THREE.Mesh(geometry, material);

    plane.position.set(0, 0, 0);
    
    // rotate the plane so up is where y is growing..
    plane.rotation.set(-Math.PI / 2, 0, 0);

    g_scene.add(plane)
}

function render() {
    requestAnimationFrame(render);
    g_renderer.render(g_scene, g_camera);
}

init();
