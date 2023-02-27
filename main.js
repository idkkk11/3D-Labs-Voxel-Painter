    //imports
    import * as THREE from 'three'
    import { OrbitControls } from 'OrbitControls';

    // variable initialisation
    let isShiftDown = false;
    let objects = [];
    let controls

    // pencil eraser initialisation
    let pencilMode = true;

    // texture initialisation
    let plainTexture = true;

    // camera initialisation
    const camera = new THREE.PerspectiveCamera(45, window.innerWidth / window.innerHeight, 1, 10000);
    camera.position.set( 500, 800, 1300 );
    camera.lookAt( 0, 0, 0 );

    // scene initialisation
    const scene = new THREE.Scene();
    scene.background = new THREE.Color( 0xF3F4F8 );

    // roll-over helpers (block preview)
    const rollOverGeo = new THREE.BoxGeometry( 50, 50, 50 );
    const rollOverMaterial = new THREE.MeshBasicMaterial( { color: 0xA6CCF5, opacity: 0.5, transparent: true } );
    const rollOverMesh = new THREE.Mesh( rollOverGeo, rollOverMaterial );
    scene.add( rollOverMesh );

    // cubes
    const cubeGeo = new THREE.BoxGeometry( 50, 50, 50 );
    const cubeMaterial = new THREE.MeshPhysicalMaterial({})
    cubeMaterial.reflectivity = 0.5
    cubeMaterial.roughness = 1
    cubeMaterial.metalness = 0
    cubeMaterial.clearcoat = 0
    cubeMaterial.clearcoatRoughness = 0
    cubeMaterial.color = new THREE.Color(0xf1f1f1)
    cubeMaterial.ior = 1.2
    cubeMaterial.thickness = 10.0

    // texture
    const texture = new THREE.TextureLoader().load( './assets/brick_roughness.jpg' );
    const material = new THREE.MeshBasicMaterial( { map: texture } );

    // grid
    const gridHelper = new THREE.GridHelper( 1000, 20 );
    scene.add( gridHelper );

    // raycaster
    const raycaster = new THREE.Raycaster();
    const pointer = new THREE.Vector2();

    // plane
    const geometry = new THREE.PlaneGeometry( 1000, 1000 );
    geometry.rotateX( - Math.PI / 2 );
    const plane = new THREE.Mesh( geometry, new THREE.MeshBasicMaterial( { color: 0xeeeeee } ) );
    scene.add( plane );
    objects.push( plane );

    // ambient light
    const ambientLight = new THREE.AmbientLight( 0x606060 );
    scene.add( ambientLight );

    // directional light
    const directionalLight = new THREE.DirectionalLight( 0xffffff );
    directionalLight.position.set( 1, 0.75, 0.5 ).normalize();
    scene.add( directionalLight );

    // renderer
    const renderer = new THREE.WebGLRenderer( { antialias: true } );
    renderer.setPixelRatio( window.devicePixelRatio );
    renderer.setSize( window.innerWidth, window.innerHeight );
    document.body.appendChild( renderer.domElement );

    //orbit controls
    controls = new OrbitControls(camera, renderer.domElement);
    controls.target.set(0, 0, 0);
    controls.enablePan = false;
    controls.enableDamping = true;

    // addEventListeners
    document.addEventListener( 'pointermove', onPointerMove );
    document.addEventListener( 'pointerdown', onPointerDown );
    document.addEventListener( 'keydown', onDocumentKeyDown );
    document.addEventListener( 'keyup', onDocumentKeyUp );
	window.addEventListener( 'resize', onWindowResize );

    document.getElementById("reset-camera").addEventListener("click", resetCamera);
    document.getElementById("top").addEventListener("click", topView);
    // document.getElementById("clear").addEventListener("click", clearScene);

    document.getElementById("pencil").addEventListener("click", modePencil);
    document.getElementById("eraser").addEventListener("click", modeEraser);

    document.getElementById("plain").addEventListener("click", modeTextureless);
    document.getElementById("brick").addEventListener("click", modeTextured);

    // initial render
    render();
    
    //FUNCTIONS ---------------------

    function modePencil() {
        pencilMode = true;
        document.getElementById("pencil").className = "yellow-circle-active";
        document.getElementById("eraser").className = "yellow-circle";
        console.log("PENCIL");
        // document.getElementById("pencil").style.border = "3px solid #000000;";

    }

    function modeEraser() {
        pencilMode = false;
        document.getElementById("pencil").className = "yellow-circle";
        document.getElementById("eraser").className = "yellow-circle-active";
        console.log("ERASER");
        // document.getElementById("pencil").style.border = "none";
    }

    function modeTextureless() {
        plainTexture = true;
        document.getElementById("plain-class").className = "texture-on";
        document.getElementById("brick-class").className = "texture";
        console.log("textureless");
    }

    function modeTextured() {
        plainTexture = false;
        document.getElementById("plain-class").className = "texture";
        document.getElementById("brick-class").className = "texture-on";
        console.log("textured");
    }
    
    function onWindowResize() {

        camera.aspect = window.innerWidth / window.innerHeight;
        camera.updateProjectionMatrix();

        renderer.setSize( window.innerWidth, window.innerHeight );

        render();

    }
  
    function onPointerMove( event ) {

        pointer.set( ( event.clientX / window.innerWidth ) * 2 - 1, - ( event.clientY / window.innerHeight ) * 2 + 1 );

        raycaster.setFromCamera( pointer, camera );

        const intersects = raycaster.intersectObjects( objects, false );

        if ( intersects.length > 0 ) {

            const intersect = intersects[ 0 ];

            rollOverMesh.position.copy( intersect.point ).add( intersect.face.normal );
            rollOverMesh.position.divideScalar( 50 ).floor().multiplyScalar( 50 ).addScalar( 25 );

            render();

        }
    }
  
    function onPointerDown( event ) {

        pointer.set( ( event.clientX / window.innerWidth ) * 2 - 1, - ( event.clientY / window.innerHeight ) * 2 + 1 );
        raycaster.setFromCamera( pointer, camera );
        const intersects = raycaster.intersectObjects( objects, false );
        
        if ( intersects.length > 0 ) {
            const intersect = intersects[ 0 ];
        
            // delete cube
            if ( isShiftDown || !pencilMode ) {
                if ( intersect.object !== plane ) { 
                    scene.remove( intersect.object );
                    objects.splice( objects.indexOf( intersect.object ), 1 );
                }
            } 

            // create cube  
            else {
                
                let voxel = new THREE.Mesh( cubeGeo, cubeMaterial );

                if ( !plainTexture ) {
                    voxel = new THREE.Mesh( cubeGeo, material );
                }
                else {
                    voxel = new THREE.Mesh( cubeGeo, cubeMaterial );
                }

                voxel.position.copy( intersect.point ).add( intersect.face.normal );
                voxel.position.divideScalar( 50 ).floor().multiplyScalar( 50 ).addScalar( 25 );
                voxel.name = "cube"
                scene.add( voxel );
                objects.push( voxel );
            }
            render();
        }
    }
  
    function onDocumentKeyDown( event ) {
        switch ( event.keyCode ) {
        case 16: isShiftDown = true; break;
        }
    }
  
    function onDocumentKeyUp( event ) {
        switch ( event.keyCode ) {
            case 16: isShiftDown = false; break;
        }
    }
  
    function render() {
        requestAnimationFrame(render)  
        renderer.render( scene, camera );
        controls.update()
    }

    function resetCamera() {
        console.log("reset camera");
        camera.position.set( 500, 800, 1300 );
        camera.lookAt( 0, 0, 0 );
    }

    function topView() {
        console.log("reset camera");
        camera.position.set( 0, 1400, 0 );
        camera.lookAt( 0, 0, 0 );
    }

    function clearScene() {
        let count = 0;
        for (let x in objects) { // scours through the objects in the scene
            if (objects[x].geometry.type == "BoxGeometry") { // makes sure only blocks are deleted, not the plane too
                // console.log(objects[x].geometry.type);
                // console.log(objects[x].geometry);
                scene.remove(objects[x]);
                count += 1;
            }
        }
        let objLen = objects.length
        for (let i in objects) {
            if (objects[i].name == "cube") {
                objects.splice(i, objLen-i)
                break
            }
        }
        // objects = objects.splice(2, count);
        console.log(objects);
    }