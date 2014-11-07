function addLights() {
 var ambientLight = new THREE.AmbientLight(0x444444);
 ambientLight.intensity = 0.0;
 scene.add(ambientLight);

 var directionalLight = new THREE.DirectionalLight(0xffffff);

 directionalLight.position.set(900, 400, 0000).normalize();
 scene.add(directionalLight);
}

function setupCamera() {
  camera.position.z = 1000;
  camera.position.y = 240;
  camera.position.x = 0;
  camera.lookAt(new THREE.Vector3(0,0,0));
}

//To get the pixels, draw the image onto a canvas. From the canvas get the Pixel (R,G,B,A)
function getTerrainPixelData()
{
  var img = document.getElementById("landscape-image");
  var canvas = document.getElementById("canvas");
  
  canvas.width = img.width;
  canvas.height = img.height;
  canvas.getContext('2d').drawImage(img, 0, 0, img.width, img.height);

  var data = canvas.getContext('2d').getImageData(0,0, img.height, img.width).data;
  var normPixels = []

  for (var i = 0, n = data.length; i < n; i += 4) {
    // get the average value of R, G and B.
    normPixels.push((data[i] + data[i+1] + data[i+2]) / 3);
  }

  return normPixels;
}

function addGround() {
  var numSegments = 100;

  var geometry = new THREE.PlaneGeometry(2400, 2400, numSegments, numSegments);
  var material = new THREE.MeshLambertMaterial({
    color: 0xccccff,
    wireframe: false
  });

  terrain = getTerrainPixelData();  

  // keep in mind, that the plane has more vertices than segments. If there's one segment, there's two vertices, if
  // there's 10 segments, there's 11 vertices, and so forth. 
  // The simplest is, if like here you have 100 segments, the image to have 101 pixels. You don't have to worry about
  // "skewing the landscape" then..

  // to check uncomment the next line, numbers should be equal
  // console.log("length: " + terrain.length + ", vertices length: " + geometry.vertices.length);

  for (var i = 0, l = geometry.vertices.length; i < l; i++)
  {
    var terrainValue = terrain[i] / 255;
    geometry.vertices[i].z = geometry.vertices[i].z + terrainValue * 200 ;
  }

  geometry.computeFaceNormals();
  geometry.computeVertexNormals();

  var plane = new THREE.Mesh(geometry, material);

  plane.position = new THREE.Vector3(0,0,0);
  // rotate the plane so up is where y is growing..

  var q = new THREE.Quaternion();
  q.setFromAxisAngle( new THREE.Vector3(-1,0,0), 90 * Math.PI / 180 );
  plane.quaternion.multiplyQuaternions( q, plane.quaternion );

  scene.add(plane)
}

function render() {
  requestAnimationFrame(render);
  renderer.render(scene, camera);
}

var scene = new THREE.Scene();
var camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 10000);
var renderer = new THREE.WebGLRenderer();
var controls = new THREE.OrbitControls( camera, renderer.domElement );

setupCamera();
addLights();
addGround();

renderer.setSize(window.innerWidth, window.innerHeight);
document.body.appendChild(renderer.domElement);

render();
