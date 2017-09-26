'use strict'

var light, vFOV, height, aspect, width, decalDiffuse, decalNormal;
var splatterNormal, decalMaterial, splatterMaterial, decalGeometry, mesh, normalMap;
var whiteTextureArray = [], normalMapTextureArray = [], start = false, moved = true, shooting = false;

var container = document.getElementById( 'container' );

var scene = new THREE.Scene();

var camera = new THREE.PerspectiveCamera( 60, window.innerWidth / window.innerHeight, .1, 1000 );
var cameraFOV = 175;
camera.position.set( 0, 0, cameraFOV );
camera.target = new THREE.Vector3();

var renderer = new THREE.WebGLRenderer( { antialias: true, alpha: true } );
renderer.setSize( window.innerWidth, window.innerHeight );
renderer.setPixelRatio( window.devicePixelRatio );
container.appendChild( renderer.domElement );

var controls = new THREE.OrbitControls( camera, renderer.domElement );
controls.minDistance = ~~(cameraFOV / 16);
controls.maxDistance = ~~(cameraFOV * 2);

scene.add( new THREE.AmbientLight( 0x443333 ) );

light = new THREE.DirectionalLight( 0xffddcc, 1 );
light.position.set( 1, 0.75, 0.5 );
scene.add( light );

light = new THREE.DirectionalLight( 0xccccff, 1 );
light.position.set( -1, 0.75, -0.5 );
scene.add( light );

var geometry = new THREE.Geometry();
geometry.vertices.push( new THREE.Vector3(), new THREE.Vector3() );

var line = new THREE.Line( geometry, new THREE.LineBasicMaterial( { linewidth: 4 } ) );
scene.add( line );

var decals = [];
var position = new THREE.Vector3();
var orientation = new THREE.Euler();
var size = new THREE.Vector3( 10, 10, 10 );

var paletteIndex = ~~Maf.randomInRange( 1, Object.keys(colorData).length + 1 );
var colorPalette = colorData['palette' + paletteIndex ];

window.addEventListener( 'load', function() {

	vFOV = camera.fov * Math.PI / 180;
	height = 2 * Math.tan( vFOV / 2 ) * cameraFOV;

	aspect = window.innerWidth / window.innerHeight;
	width = height * aspect;

	var iterations = 1;
	var textureLoader = new THREE.TextureLoader();

	decalDiffuse = textureLoader.load( 'assets/transparent.png' );

	normalMap = textureLoader.load( 'assets/textures/normal/normal-map-75.jpg' );
	// normalMap = textureLoader.load( textureData.normal[ ~~Maf.randomInRange( 0, textureData.normal.length + 1 ) ] );

	decalMaterial = new THREE.MeshPhongMaterial( {
		map: decalDiffuse,
		normalScale: new THREE.Vector2( 1, 1 ),
		transparent: true,
		depthTest: true,
		depthWrite: false,
		polygonOffset: true,
		polygonOffsetFactor: - 4,
		wireframe: false,
		side: THREE.DoubleSide
	} );

	decalGeometry = new THREE.PlaneGeometry( width, height, 0 );
	mesh = new THREE.Mesh( decalGeometry, decalMaterial );
	scene.add( mesh );

	var brushIndex = ~~Maf.randomInRange( 1, Object.keys(textureData).length );

	function loadTextures() {
		iterations++;
		if (iterations === textureData['white' + brushIndex].length) init();
	}

	for (let path of textureData['white' + brushIndex]) {
		textureLoader.load( path, function(texture) {
			whiteTextureArray.push(texture);
			loadTextures();
		});
	}

	window.addEventListener( 'resize', onWindowResize, false );

});

function init() {

	start = true;

	var loading = document.getElementById( 'loading' );
	var directions = document.getElementById( 'directions' );

	loading.classList.remove('pulsate');
	loading.style.opacity = 0;
	directions.style.opacity = 1;

	controls.addEventListener( 'change', function() {

		moved = true;

	} );

	window.addEventListener( 'mousedown', function () {

		if ( start ) directions.style.opacity = 0;

		moved = false;
		shooting = !shooting;

	}, false );

	window.addEventListener( 'mouseup', function() {

		if (!moved && shooting) shoot();

	} );

	animate();

}

function shoot() {

	var splatterMaterial = new THREE.MeshPhongMaterial( {
		map: whiteTextureArray[ ~~Maf.randomInRange( 0, whiteTextureArray.length ) ],
		normalMap: normalMap,
		normalScale: new THREE.Vector2( 1, 1 ),
		shininess: 10,
		opacity: .9,
		transparent: true,
		depthTest: true,
		depthWrite: false,
		polygonOffset: true,
		polygonOffsetFactor: - 4,
		wireframe: false,
		side: THREE.DoubleSide
	});

	var randomPoints = THREE.GeometryUtils.randomPointsInGeometry( decalGeometry, 1 );

	orientation.z = Math.random() * 2 * Math.PI;

	var scaleMin = ~~Maf.randomInRange( 25, 75 );
	var scaleMax = ~~Maf.randomInRange( 100, 175 );
	var scale = scaleMin + Math.random() * ( scaleMax - scaleMin );
	size.set( scale, scale, scale );

	var material = splatterMaterial.clone();
	material.color.setHex( colorPalette[ ~~Maf.randomInRange( 0, colorPalette.length ) ] );

	var m = new THREE.Mesh( new THREE.DecalGeometry( mesh, randomPoints[0], orientation, size ), material );

	decals.push( m );
	scene.add( m );

}

function onWindowResize() {

	camera.aspect = window.innerWidth / window.innerHeight;
	camera.updateProjectionMatrix();

	renderer.setSize( window.innerWidth, window.innerHeight );

}

function animate() {

	if (!moved && shooting) shoot();

	requestAnimationFrame( animate );

	renderer.render( scene, camera );

}
