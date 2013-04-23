<link rel="stylesheet" href="../css/game.css">
<link rel="stylesheet" href="../css/animate.css">
<style>

body{
				
	background-color: ffffff;
	margin: 0px;
	overflow: hidden;
					
}
	
.renderframe{
	
	position:absolute;
	width:100%;
	height:100%;
	
	-webkit-background-size: 50px 50px;
	-moz-background-size: 50px 50px;
	background-size: 50px 50px; /* Controls the size of the stripes */
	
	-moz-box-shadow: 1px 1px 8px gray;
	-webkit-box-shadow: 1px 1px 8px gray;
	box-shadow: 1px 1px 8px gray;
}
	
</style>

<script src="../api/jquery/jquery.min.js"></script>

<script src="../api/threejs/three.min.js"></script>
<script src='../api/threex/THREEx.KeyboardState.js'></script>
<script src='../api/threex/THREEx.WindowResize.js'></script>

<script src="../api/ThreeJS/fonts/gentilis_bold.typeface.js"></script>
<script src="../api/ThreeJS/fonts/gentilis_regular.typeface.js"></script>
<script src="../api/ThreeJS/fonts/optimer_bold.typeface.js"></script>
<script src="../api/ThreeJS/fonts/optimer_regular.typeface.js"></script>
<script src="../api/ThreeJS/fonts/helvetiker_bold.typeface.js"></script>
<script src="../api/ThreeJS/fonts/helvetiker_regular.typeface.js"></script>
<script src="../api/ThreeJS/fonts/droid/droid_sans_regular.typeface.js"></script>
<script src="../api/ThreeJS/fonts/droid/droid_sans_bold.typeface.js"></script>
<script src="../api/ThreeJS/fonts/droid/droid_serif_regular.typeface.js"></script>
<script src="../api/ThreeJS/fonts/droid/droid_serif_bold.typeface.js"></script>

<script src="../api/threejs/js/libs/stats.min.js"></script>

<script src="../api/threejs/js/shaders/CopyShader.js"></script>
<script src="../api/threejs/js/shaders/FilmShader.js"></script>

<script src="../api/threejs/js/postprocessing/EffectComposer.js"></script>
<script src="../api/threejs/js/postprocessing/ShaderPass.js"></script>
<script src="../api/threejs/js/postprocessing/MaskPass.js"></script>
<script src="../api/threejs/js/postprocessing/RenderPass.js"></script>
<script src="../api/threejs/js/postprocessing/FilmPass.js"></script>

<script>

	var container;
	
	var messageBox;
	
	var camera, cameraWithSnake, scene, renderer;		
	var platformGroup, snakeGroup, foodGroup, lightGroup;
	var lightLampGroup;
	var scoreBoardGroup, displayMenuGroup;
	
	var scoreTextMesh;
	
	var spotLightGroup;
	var spotLightColorArray = [0xffffff, 0xff00ff, 0xff0000, 0x00ff00];
	
	var snakeCube, platformCube;
	var tail;
	
	var row, col;
	var foodScore = 0;
	var levelRatio = 4;
	
	var delta, timer;
	var lastKeyPressTimeStamp = 0;
	
	var foodCube, foodcubeMaterial;
	
	var keyPressed;
	
	var clock = new THREE.Clock();
	var platformCubeTexture;
	var platformWidth, platformHeight;
	var platformSize, snakeCubeSize;
	
	var snakeCubeTexture;
	var snakeXStepSign, snakeYStepSign;
	var snakeXStep, snakeYStep, snakeZStep;
	
	var snake_array;
	var food;
	var keyboard = new THREEx.KeyboardState();
	
	var gameStepTime = 200;
	var gameStepFlag = true;
	var pauseFlag = 0;
	var gameOverFlag = 2;
	var lastArrowKeyPressed = "right";

	var frameTime = 0; // ms
	var cumulatedFrameTime = 0; // ms
	var lastFrameTime = Date.now(); // timestamp
	
	var width = window.innerWidth || 2;
	var height = window.innerHeight || 2;

	var halfWidth = width / 2;
	var halfHeight = height / 2;
	
	var menuTextMessageMesh;
	var triggerFlag = 1;
	var alertAnimationType = "";
	var alertVisibleFlag; 
	
	function triggerAnimation(animateType, visibilityFlag, messageString){
	
		triggerFlag = 0;
		messageBox.attr("class", "alertmessage");
		messageBox.addClass(animateType);
		//myBox.css("-webkit-animation-play-state","running");
		
		messageBox.html(messageString);
		
		if(alertVisibleFlag == 1){
			messageBox.css("visibility","visible");
		}
		
		messageBox.one('webkitAnimationEnd oanimationend msAnimationEnd animationend',
		function(e){
				//alert("Animation End");
				triggerFlag = 1;
				messageBox.removeClass(animateType);
				if(alertVisibleFlag == 0){
					messageBox.css("visibility","hidden");
				}
				//messageBox.css("visibility",visibility);
			});
	}
			
	
	function checkKeyboardStroke(){
		document.onkeydown = function key_event(evt){
			var key = evt.keyCode;
			
			if(keyboard.pressed("p") ){
				if(!(gameOverFlag > 0)){
					keyPressed = "P";
					pauseFlag = 1;
			
					messageBox.css("visibility","visible");
					//messageBox.html("Press R to Resume");
					
					alertVisibleFlag = 1;
					triggerAnimation("animated bounce", 1, "Press R to Resume");
				}
				
			} else if(keyboard.pressed("r") ){
				
				if(!(gameOverFlag > 0)){
			
					alertVisibleFlag = 0;
					triggerAnimation("animated fadeOutDown", 0, "Press R to Resume");
				}
				
				keyPressed = lastArrowKeyPressed;
				pauseFlag = 0;
				
			} 
			if(pauseFlag == 0){	
			if(keyboard.pressed("s") ){
		
				keyPressed = "right";
				lastArrowKeyPressed = "right";
				if(gameOverFlag == 1){
					alertVisibleFlag = 0;
					triggerAnimation("animated fadeOutDown", 0, "Game Over<br><br>Press S to Start Game");
				}else{
					alertVisibleFlag = 0;
					triggerAnimation("animated fadeOutDown", 0, "Press S to Start Game");
				}
				//messageBox.innerHTML = "";
				//displayMenuGroup.remove(menuTextMessageMesh);
				
				var obj;
				for(var i = snakeGroup.children.length-1; i>=0; i--)
				{
					obj = snakeGroup.children[i];
					snakeGroup.remove(obj);
				}
				
				/*
				for(var i in snakeGroup.children){
					snakeGroup.remove(snakeGroup.children[i]);
				}
			lx`	*/
				
				gameStepTime = 100;
				foodScore = 0;
				levelRatio = 4;
				pauseFlag = 1;
					
				//if(gameOverFlag > 0
				{
					create_snake();
					create_3D_snake();
					create_food();
				}
				
				gameOverFlag = 0;
					
				removeScoreTextGeometry();
				setScoreTextGeometry(10*foodScore);
				
					
				pauseFlag = 0;
				
					
				}
			}
			if(pauseFlag == 0)
			//if(gameOverFlag != 2)
			{
				var currentTimeStamp = Date.now();
				var timeStampDif = 90;
				var currentTimeStampDif = currentTimeStamp - lastKeyPressTimeStamp;
				if( key == 39  && keyPressed != "left" && keyPressed != "right" && currentTimeStampDif>timeStampDif){
					keyPressed = "right";	
					lastArrowKeyPressed = keyPressed;
					lastKeyPressTimeStamp = currentTimeStamp;
					
				}
				else if(key == 37  && keyPressed != "right" && keyPressed != "left" && currentTimeStampDif>timeStampDif){
					keyPressed = "left";	
					lastArrowKeyPressed = keyPressed;
					lastKeyPressTimeStamp = currentTimeStamp;
				}
				else if(key == 38  && keyPressed != "down" && keyPressed != "up" && currentTimeStampDif>timeStampDif){
					keyPressed = "up";	
					lastArrowKeyPressed = keyPressed;
					lastKeyPressTimeStamp = currentTimeStamp;
				}
				else if(key == 40 && keyPressed != "up" && keyPressed != "down" && currentTimeStampDif>timeStampDif){
					keyPressed = "down";	
					lastArrowKeyPressed = keyPressed;
					lastKeyPressTimeStamp = currentTimeStamp;
				} 
			}
			
			if(key) evt.preventDefault();
		}
	}
	
	function create_snake(){
		var length = 5; 
		snake_array = []; 
		for(var i = length-1; i>=0; i--)
		{
			snake_array.push({x: i, y:0});
		}
	}
	
	function isEmptyCell(x, y, array){
		for(var i = 0; i < array.length; i++)
		{
			if(array[i].x == x && array[i].y == y)
			 return false;
		}
		return true;
	}
	
	function create_food(){
		foodGroup.remove(foodGroup.children[0]);		
		var flag = true;
		while(flag) 
		{
	                row = Math.round(Math.random()*(platformWidth-snakeCubeSize)/snakeCubeSize);
	                col = Math.round(Math.random()*(platformHeight-snakeCubeSize)/snakeCubeSize);
	                if(isEmptyCell(row, col, snake_array)) {
						food = {
							x: row, 
							y: col, 
						};
						
						var foodCubeGeometry = new THREE.SphereGeometry(snakeCubeSize, 20, 20);
						foodCube = new THREE.Mesh(foodCubeGeometry, foodcubeMaterial);
						foodCube.position.set( snakeCubeSize*food.x, snakeCubeSize, snakeCubeSize*food.y ); 
						foodCube.castShadow = true;
						foodCube.receiveShadow = true;
						foodCube.scale.x = 0.5;
						foodCube.scale.y = 0.5;
						foodCube.scale.z = 0.5;
				    	foodGroup.add(foodCube);
				
	                    flag = false;
	               }
	       }
	}
	
	function setSnakeCube(){
		var tail;
		var lightLamp = lightGroup.children[0];
		
		snakeXStep = snake_array[0].x;
		snakeYStep = snake_array[0].y;
		
		if( keyPressed == "right"){
			snakeXStep++ ;
		
		}else if(keyPressed == "left"){
			snakeXStep-- ;
			
		}else if(keyPressed == "up"){
			snakeYStep-- ;		
					
		}else if(keyPressed == "down"){
			snakeYStep++ ;		
		
		}else if(keyPressed == "P"){
			pauseFlag = 1;
			
		}
		
		if((snakeXStep == -1 
			|| snakeXStep == platformWidth/snakeCubeSize 
			|| snakeYStep == -1 
			|| snakeYStep == platformHeight/snakeCubeSize 
			|| check_collision(snakeXStep, snakeYStep, snake_array)))
		{	
		//	init();
		
			//alert(snakeXStep + "y" + snakeYStep);
			gameOverFlag = 1;
			alertVisibleFlag = 1;
			triggerAnimation("animated fadeInUp", 1, "Game Over<br><br>Press S to Start Game");
			return;
		}
		
		
		if(snakeXStep == food.x && snakeYStep == food.y)
		{
			tail = {x: snakeXStep, y: snakeYStep};	
			create_food();
			
			foodScore++;
		
			var snakeCubeGeometry = new THREE.CubeGeometry(snakeCubeSize, snakeCubeSize, snakeCubeSize);
			snakeCube = new THREE.Mesh(snakeCubeGeometry, snakeMaterial);
			snakeCube.position.set( snakeCubeSize*tail.x, snakeCubeSize, snakeCubeSize*tail.y ); 
			snakeCube.castShadow = true;
			snakeCube.receiveShadow = true;
			snakeGroup.add(snakeCube);
	
			removeScoreTextGeometry();
			setScoreTextGeometry(10*foodScore);
			
		}else
		{
			tail = snake_array.pop();
			tail.x = snakeXStep; 
			tail.y = snakeYStep;
		}
		
		snake_array.unshift(tail);
		var snakeCubeArray = snakeGroup.children;
	
		for(var i=0; i<snakeCubeArray.length; i++){
			
			var snake_position = snake_array[i];
			
			snakeCube = snakeCubeArray[i];
			var snakeCubePosition = snakeCube.position;
			snakeCubePosition.x = snakeCubeSize*snake_position.x;
			snakeCubePosition.z = snakeCubeSize*snake_position.y;
			
			snakeCube.position.set( snakeCubePosition.x, snakeCubePosition.y, snakeCubePosition.z); 
		}
	}
	
	function check_collision(x, y, array){
		
		for(var i = 0; i < array.length; i++)
		{
			if(array[i].x == x && array[i].y == y)
			 return true;
		}
		return false;
	}
	
	function create_3D_snake(){
	
		snakeMaterial = new THREE.MeshLambertMaterial({ map: snakeCubeTexture });
		var snakeCubeGeometry = new THREE.CubeGeometry(snakeCubeSize, snakeCubeSize, snakeCubeSize);
		for(var i=snake_array.length-1; i>=0; i--){
			var snake_position = snake_array[i];
			snakeCube = new THREE.Mesh(snakeCubeGeometry, snakeMaterial);
			snakeCube.position.set( snakeCubeSize*snake_position.x, snakeCubeSize, snakeCubeSize*snake_position.y ); 
			snakeCube.castShadow = true;
			snakeCube.receiveShadow = true;
			snakeGroup.add(snakeCube);
		}
	}

	function initGame(){
		
		container = $( "#canvasframe" )[0];
		messageBox = $("#helpmessage");
	
		var stats = new Stats();
		stats.domElement.style.position = 'absolute';
		stats.domElement.style.left = '10px';
		stats.domElement.style.top = '390px';
		container.appendChild(stats.domElement);
		
		platformWidth = 300;
		platformHeight = 300;
		platformSize = 300;
		snakeCubeSize = 10;
		
		snakeXStepSign = 1;
		snakeYStepSign = 0;
		
		create_snake();
		
		//texture = new THREE.Texture();
		platformCubeTexture = THREE.ImageUtils.loadTexture( 'texture/crate.jpg' );
		var platformCubeTexture2 = THREE.ImageUtils.loadTexture( 'texture/Wall_TH.jpg' );
		
		snakeCubeTexture = THREE.ImageUtils.loadTexture( 'texture/snake_skin.jpg' );
		snakeMaterial = new THREE.MeshLambertMaterial({ map: snakeCubeTexture });
		
		var foodCubeTexture = THREE.ImageUtils.loadTexture( 'texture/Woodtiles_TH.jpg' );
		foodcubeMaterial = new THREE.MeshLambertMaterial({ map: foodCubeTexture });

		scene = new THREE.Scene();
		camera = new THREE.PerspectiveCamera(75, window.innerWidth/window.innerHeight, 0.1, 1000);
		scene.position.set( platformWidth/2, platformHeight/2, 0 );
		
		cameraWithSnake = new THREE.PerspectiveCamera(75, window.innerWidth/window.innerHeight, 0.1, 1000);
		
		//scene.fog = new THREE.FogExp2(0xffffff, 0.001);
		
		camera.position.set( platformWidth/2-4, platformHeight/2, platformSize*3/2.6);
		camera.rotation.x += degToRad(-45);
		//camera.lookAt( scene.position );
	
		renderer = new THREE.WebGLRenderer({canvas:container, antialias:true});
		
		//alert("ss"+$( "#container" ).width());
		renderer.setSize($( "#canvasframe" ).width(), $( "#canvasframe" ).height());
		renderer.shadowMapEnabled = true;
		renderer.shadowMapSoft = true;
		
		renderer.setClearColor(0xffffff, 0.7);
		
		
		//displayMenuGroup = new THREE.Object3D();
		//scene.add( displayMenuGroup );
		
		platformGroup = new THREE.Object3D();
		scene.add( platformGroup );
		
		scoreBoardGroup = new THREE.Object3D();
		scene.add( scoreBoardGroup );
		
		snakeGroup = new THREE.Object3D();
		scene.add( snakeGroup );
		
		foodGroup = new THREE.Object3D();
		scene.add( foodGroup );
		
		lightGroup = new THREE.Object3D();
		scene.add( lightGroup );
		
		spotLightGroup = new THREE.Object3D();
		scene.add( spotLightGroup );
	
		var platformMaterial = new THREE.MeshLambertMaterial({ map: platformCubeTexture });
		var platformMaterial2 = new THREE.MeshLambertMaterial({ map: platformCubeTexture2 });
		var platformCubeGeometry = new THREE.CubeGeometry(snakeCubeSize, snakeCubeSize, snakeCubeSize);
		var platformPlaneGeometry = new THREE.PlaneGeometry(snakeCubeSize, snakeCubeSize	);
		
		createScoreBoard();
	
		for(var i=0; i<(platformWidth/snakeCubeSize); i++){
			for(var j=0; j<(platformHeight/snakeCubeSize); j++){
				
				platformCube = new THREE.Mesh(platformPlaneGeometry, platformMaterial);
			
				platformCube.position.set( snakeCubeSize*i, 5, snakeCubeSize*j ); 
				platformCube.rotation.x = - Math.PI / 2;
				//platformCube.
			//	platformCube.castShadow = true;
				platformCube.receiveShadow = true;
		    	platformGroup.add(platformCube);
			}
		}
		
		for(var i=0; i<(platformWidth/snakeCubeSize); i++){
			for(var j=0; j<2; j++){
				platformCube = new THREE.Mesh(platformCubeGeometry, platformMaterial2);
				platformCube.position.set( snakeCubeSize*i, snakeCubeSize, -snakeCubeSize+(platformHeight+snakeCubeSize)*j); 
				platformCube.castShadow = true;
				platformCube.receiveShadow = true;
		    	platformGroup.add(platformCube);
			}
		}
		
		for(var i=0; i<(platformHeight/snakeCubeSize); i++){
			for(var j=0; j<2; j++){
				platformCube = new THREE.Mesh(platformCubeGeometry, platformMaterial2);
				platformCube.position.set( -snakeCubeSize+(platformWidth+snakeCubeSize)*j, snakeCubeSize, snakeCubeSize*i); 
				platformCube.castShadow = true;
				platformCube.receiveShadow = true;
		    	platformGroup.add(platformCube);
			}
		}
		
		create_3D_snake();
					
		create_food();
	
        var ambientLight = new THREE.AmbientLight(0xcccccc);
       	scene.add(ambientLight);
        
        var directionalLight = new THREE.DirectionalLight(0xffffff);
        directionalLight.position.set(platformWidth/2, platformHeight, 60).normalize();
       	//scene.add(directionalLight);

		
		var spotLight = new THREE.SpotLight( 0xffffff ); 
		spotLight.position.set( platformWidth*2, platformHeight*1.6, platformSize*2 ); 
		spotLight.castShadow = true; 
		//spotLight.shadowMapWidth = 500; 
		//spotLight.shadowMapHeight = 100;
		scene.add(spotLight);
		
		/*
		var renderModel = new THREE.RenderPass( scene, camera );
		//var effectFilm = new THREE.FilmPass( 0.35, 0.75, 2048, false );
		var effectFilm = new THREE.FilmPass( 0.6, 0.3, 5000, false );

		effectFilm.renderToScreen = true;
		composer = new THREE.EffectComposer( renderer );
		composer.addPass( renderModel );
		composer.addPass( effectFilm );
		*/
		
		THREEx.WindowResize(renderer, camera);
		
		//document.onkeydown = key_event;
		//document.onkeypress = key_event;
		
		window.onblur = function() {
			if(!(gameOverFlag > 0)){
				keyPressed = "P";
				pauseFlag = 1;
				render();
				
				alertVisibleFlag = 1;
				triggerAnimation("animated bounce", 1, "Press R to Resume");
			}
			
		};
		
		animate();
		//setInterval(setSnakeCube, 40);
		
	}
	
	function createScoreBoard(){
		//var scoreStandCubeTexture = THREE.ImageUtils.loadTexture( 'texture/crate.jpg' );
		var scoreStandMaterial = new THREE.MeshLambertMaterial({ map: platformCubeTexture });
		var scoreStandCubeGeometry = new THREE.CubeGeometry(snakeCubeSize, snakeCubeSize, snakeCubeSize);
		
		var scoreStandCube;
		
		for(var i=1; i<4; i+=2){
			scoreStandCube = new THREE.Mesh(scoreStandCubeGeometry, scoreStandMaterial);
			scoreStandCube.position.set(i*platformWidth/4-snakeCubeSize, snakeCubeSize*2, -snakeCubeSize); 
			scoreStandCube.castShadow = true;
			scoreStandCube.receiveShadow = true;
    		scoreBoardGroup.add(scoreStandCube);
		}
		
		var scorePlatformWidth = platformWidth/1.5;
		
		//var scorePlatformCubeTexture = THREE.ImageUtils.loadTexture( 'texture/crate.jpg' );
		var scorePlatformMaterial = new THREE.MeshLambertMaterial({ map: platformCubeTexture });
		var scorePlatformCubeGeometry = new THREE.CubeGeometry(scorePlatformWidth, snakeCubeSize/2, snakeCubeSize);
		
		var scorePlatformCube;
		scorePlatformCube = new THREE.Mesh(scorePlatformCubeGeometry, scorePlatformMaterial);
		scorePlatformCube.position.set((platformWidth-scorePlatformWidth)*3/2-snakeCubeSize, snakeCubeSize*2.8, -snakeCubeSize); 
		scorePlatformCube.castShadow = true;
		scorePlatformCube.receiveShadow = true;
		scoreBoardGroup.add(scorePlatformCube);

		scorePlatformCube = new THREE.Mesh(scorePlatformCubeGeometry, scorePlatformMaterial);
		scorePlatformCube.position.set((platformWidth-scorePlatformWidth)*3/2-snakeCubeSize, snakeCubeSize*2.8, -snakeCubeSize); 
		scorePlatformCube.castShadow = true;
		scorePlatformCube.receiveShadow = true;
		scoreBoardGroup.add(scorePlatformCube);
		setScoreTextLabelGeometry();
		setScoreTextGeometry(foodScore);

	}
	
	function setScoreTextLabelGeometry(){
		
			var scorePlatformWidth = platformWidth/1.5;
			var textMaterial = new THREE.MeshBasicMaterial({ color: 0x00bbbb });
								
			scoreTextMesh = new THREE.Mesh( getTextGeometry("Score: ", "gentilis"), textMaterial );
			scoreTextMesh.castShadow = true;
			scoreTextMesh.receiveShadow = true;
			scoreTextMesh.position.set((platformWidth-scorePlatformWidth)*3/2-snakeCubeSize*6, snakeCubeSize*3.2, -snakeCubeSize); 
			scoreBoardGroup.add(scoreTextMesh);
	}
	
	function setScoreTextGeometry(scoreString){
		
			var scorePlatformWidth = platformWidth/1.5;
			var textMaterial = new THREE.MeshBasicMaterial({ color: 0x00cc00 });
			
			scoreTextMesh = new THREE.Mesh( getTextGeometry(scoreString, "gentilis"), textMaterial );
			scoreTextMesh.castShadow = true;
			scoreTextMesh.receiveShadow = true;
			scoreTextMesh.position.set((platformWidth-scorePlatformWidth)*3/2+snakeCubeSize, snakeCubeSize*3.2, -snakeCubeSize); 
			scoreBoardGroup.add(scoreTextMesh);
	}
	
	function removeScoreTextGeometry(){
		scoreBoardGroup.remove( scoreTextMesh );
	}
	
	function getTextGeometry(textStr, fontType){
		var textGeometry = new THREE.TextGeometry(textStr, {

			size: 17,
			height: 3,
			curveSegments: 1,

			font: fontType,
			weight: "normal",
			style: "normal",

			bevelThickness: 1,
			bevelSize: 1,
			bevelEnabled: true

		});
		return textGeometry;
	}
	
	function getTextGeometryWithSize(textStr, fontType, fontSize){
		var textGeometry = new THREE.TextGeometry(textStr, {

			size: fontSize,
			height: 1,
			curveSegments: 0,

			font: fontType,
			weight: "normal",
			style: "normal",

			bevelThickness: 1,
			bevelSize: 0.3,
			bevelEnabled: true

		});
		return textGeometry;
	}
	
	
	function checkLevelRatio(){
		
		if((foodScore % levelRatio == 0) && foodScore!=0 && gameStepFlag==true){
			gameStepTime -= levelRatio;
			gameStepFlag = false;
		}
		
		if(foodScore % levelRatio != 0){
			gameStepFlag = true;
		}
		
		if(gameStepTime <= 0){
			gameStepTime = 0;
		}
	}
	
	function animate() {
		requestAnimationFrame( animate );
		render();
		checkKeyboardStroke();
		stats.update();
	}
	
	
	function render(){ 
		//platformGroup.rotation.x += 0.01; 
		//platformGroup.rotation.y += 0.01; 
		//platformGroup.rotation.z += 0.01; 
		
		//snakeGroup.rotation.x += 0.005;
		//snakeGroup.rotation.y += 0.01;
		
		//foodGroup.rotation.y += 0.01;
		
		//lightGroup.rotation.x += 0.005;
		//lightGroup.rotation.y += 0.005;
		
		delta = clock.getDelta();
		
		var time = Date.now();
		
		frameTime = time - lastFrameTime;
		//cumulatedFrameTime += frameTime;
		if(frameTime >= gameStepTime){
			
			if(pauseFlag==0 && gameOverFlag==0){
				setSnakeCube();
				checkLevelRatio();
			}
			
			cumulatedFrameTime = 0;
			//time = Date.now();
			lastFrameTime = time;
			
		}

		//timer = Date.now() * 0.0003;

		//camera.position.x = platformWidth/2 + Math.cos( timer ) * platformWidth/3;
		//camera.position.y = platformHeight/2 + Math.sin( timer ) *  platformWidth/4;
		//camera.position.z = platformHeight/2 + Math.cos( timer ) *  platformWidth/4;
		//camera.lookAt( scene.position );
		
		
		//timer = Date.now() * 0.005;
		//foodCube.position.y = snakeCubeSize*2 +  Math.sin( timer ) *  snakeCubeSize;
		
		rotateFood();
		
		
		//camera.lookAt( snakeGroup.children[0].position );
		//renderer.render(scene, camera);
	
		renderer.render(scene, camera);
		
		/*
		if(gameOverFlag==1 || pauseFlag==1)
		{
			composer.render( delta );
		}
		*/
	} 
	
	function rotateFood(){
		foodCube.rotation.y += 0.1;
	}
	
	function degToRad(angle){
		return angle*Math.PI/180.00;
	}
	
	function radToDeg(angle){
		return angle*180.00/Math.PI;
	}

	
</script>