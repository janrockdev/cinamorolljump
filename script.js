function getRandomInt(min, max) {
    return Math.floor(Math.random() * (max - min + 1)) + min;
  }
  
  const canvas = document.getElementById('gameCanvas');
  const ctx = canvas.getContext('2d');
  
  const character = {
    x: 50,
    y: canvas.height - 100,
    width: 150,
    height: 150,
    velocityY: 0,
    gravity: 0.7,
    isJumping: false,
    image: new Image(),
  };
  
  character.image.src = 'character.png';
  
  const background = {
    image: new Image(),
    x: 0,
    y: 0,
    width: canvas.width,
    height: canvas.height,
  };
  
  background.image.src = 'images/background.jpg';
  
  const jumpSound = new Audio('sounds/jump.wav');
  const collisionSound = new Audio('sounds/crash.wav');
  const backgroundMusic = new Audio('sounds/music.wav');
  backgroundMusic.loop = true; // Loop the background music

  const obstacleImageSources = [
    'images/obstacle1.png',
    'images/obstacle2.png',
    'images/obstacle3.png',
  ];
  const obstacleImages = [];
  
  const obstacles = [];
  let frameCount = 0;
  let nextObstacleFrame = getRandomInt(100, 300); // Adjust min and max as needed
  let obstaclesPassed = 0; // Counter for obstacles passed
  let obstacleBaseSpeed = 5; // Initial obstacle speed
  
  document.addEventListener('keydown', function (event) {
    if ((event.code === 'Space' || event.key === ' ') && !character.isJumping) {
      character.isJumping = true;
      character.velocityY = -20;
      jumpSound.play();
    }
  });
  
  function preloadObstacleImages() {
    const promises = obstacleImageSources.map((src) => {
      return new Promise((resolve, reject) => {
        const img = new Image();
        img.src = src;
        img.onload = () => {
          obstacleImages.push(img);
          resolve();
        };
        img.onerror = () => {
          console.error('Failed to load obstacle image:', src);
          reject(new Error('Failed to load obstacle image'));
        };
      });
    });
  
    return Promise.all(promises);
  }
  
  // Start the game after all images have loaded
  Promise.all([
    preloadObstacleImages(),
    new Promise((resolve, reject) => {
      character.image.onload = resolve;
      character.image.onerror = () => {
        console.error('Failed to load character image.');
        alert('Failed to load character image.');
        reject(new Error('Failed to load character image'));
      };
    }),
    new Promise((resolve, reject) => {
      background.image.onload = resolve;
      background.image.onerror = () => {
        console.error('Failed to load background image.');
        alert('Failed to load background image.');
        reject(new Error('Failed to load background image'));
      };
    }),
  ]).then(() => {
    update();
  }).catch((err) => {
    console.error('Failed to load images:', err);
  });
  
  function update() {
    frameCount++;
    backgroundMusic.play();
  
    // Apply gravity
    character.velocityY += character.gravity;
    character.y += character.velocityY;
  
    // Ground collision
    if (character.y + character.height >= canvas.height) {
      character.y = canvas.height - character.height;
      character.velocityY = 0;
      character.isJumping = false;
    }
  
    // Move the background for scrolling effect
    background.x -= 1; // Adjust speed as needed
  
    // Reset background position to create a seamless loop
    if (background.x <= -background.width) {
      background.x = 0;
    }
  
    // Draw the background
    ctx.drawImage(background.image, background.x, background.y, background.width, background.height);
    ctx.drawImage(
      background.image,
      background.x + background.width,
      background.y,
      background.width,
      background.height
    );
  
    // Generate obstacles at variable intervals
    if (frameCount >= nextObstacleFrame) {
      const obstacleRandon = getRandomInt(40, 80);
      const obstacleHeight = obstacleRandon;
      const obstacleWidth = obstacleRandon - 10;
  
      // Select a random obstacle image
      const randomImageIndex = getRandomInt(0, obstacleImages.length - 1);
      const obstacleImage = obstacleImages[randomImageIndex];
  
      const obstacle = {
        x: canvas.width,
        y: canvas.height - obstacleHeight,
        width: obstacleWidth,
        height: obstacleHeight,
        image: obstacleImage,
        speed: obstacleBaseSpeed,
      };
      obstacles.push(obstacle);
  
      // Set the frame count for the next obstacle
      nextObstacleFrame = frameCount + getRandomInt(100, 300); // Adjust min and max as needed
    }
  
    // Move and draw obstacles
    for (let i = 0; i < obstacles.length; i++) {
      const obstacle = obstacles[i];
  
      // Move obstacle to the left
      obstacle.x -= obstacle.speed;
  
      // Check if obstacle has passed the character without collision
      if (obstacle.x + obstacle.width < character.x && !obstacle.passed) {
        obstacle.passed = true; // Mark obstacle as passed
        obstaclesPassed++; // Increment obstacles passed counter
  
        // Increase obstacle speed every 10 obstacles
        if (obstaclesPassed % 10 === 0) {
          obstacleBaseSpeed += 1; // Increase base speed
          console.log('Increased obstacle speed to:', obstacleBaseSpeed);
        }
      }
  
      // Remove off-screen obstacles
      if (obstacle.x + obstacle.width < 0) {
        obstacles.splice(i, 1);
        i--; // Adjust index after removal
        continue;
      }
  
      // Collision detection
      if (
        character.x < (obstacle.x + obstacle.width) - 40 &&
        (character.x + character.width) - 40 > obstacle.x &&
        character.y < obstacle.y + obstacle.height &&
        character.y + character.height > obstacle.y
      ) {
        collisionSound.play();
        alert('Game Over! Obstacles passed: ' + obstaclesPassed);
        document.location.reload();
        return; // Stop the update loop
      }
  
      // Draw obstacle
      ctx.drawImage(obstacle.image, obstacle.x, obstacle.y, obstacle.width, obstacle.height);
    }
  
    // Draw character
    ctx.drawImage(character.image, character.x, character.y, character.width, character.height);
  
    // Display obstacles passed counter
    ctx.font = '40px Arial';
    ctx.fillStyle = 'white';
    ctx.fillText('Obstacles Passed: ' + obstaclesPassed, 200, 60);
  
    // Request next frame
    requestAnimationFrame(update);
  }
  