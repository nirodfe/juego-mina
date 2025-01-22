class MenuScene extends Phaser.Scene {
    constructor() {
        super('MenuScene');
    }

    preload() {
        this.load.image('fondoMenu', 'assets/fondoMenu.png'); // Reemplaza 'fondoMenu.png' con el nombre del archivo que subiste
    }

    create() {
        // Agregar la imagen de fondo centrada y ajustada al tamaño de la pantalla
        this.add.image(
            this.cameras.main.width / 2, // Centrar en el eje X
            this.cameras.main.height / 2, // Centrar en el eje Y
            'fondoMenu' // Nombre de la imagen cargada en preload
        )
            .setOrigin(0.5) // Centrar la imagen en su punto medio
            .setDisplaySize(this.cameras.main.width, this.cameras.main.height); // Ajustar al tamaño de la pantalla

        // Centrar el título con un ajuste hacia la izquierda
        this.add.text(
            this.cameras.main.width / 2 - 15, // Mover hacia la izquierda
            this.cameras.main.height / 3 + 20, // Mantener la misma altura
            'Juego Mina',
            { fontSize: '48px', fill: '#fff' }
        ).setOrigin(0.5);

        // Centrar el botón con un ajuste hacia la izquierda
        const boton = this.add.text(
            this.cameras.main.width / 2 - 15, // Mover hacia la izquierda
            this.cameras.main.height / 2 + 30, // Mantener la misma altura
            'Iniciar Juego',
            { fontSize: '32px', fill: '#0f0' }
        )
            .setOrigin(0.5)
            .setInteractive()
            .on('pointerdown', () => this.scene.start('GameScene')) // Cambiar a la escena del juego
            .on('pointerover', () => boton.setStyle({ fill: '#ff0' })) // Cambiar color al pasar el mouse
            .on('pointerout', () => boton.setStyle({ fill: '#0f0' })); // Restaurar color
    }
}

class GameScene extends Phaser.Scene {
    constructor() {
        super('GameScene');
        this.moving = false; // Bandera para controlar si está en movimiento
        this.direction = null; // Dirección actual de movimiento
    }

    preload() {
        this.load.image('personaje', 'assets/personaje.png'); // Cargar la imagen del personaje
        this.load.image('nube1', 'assets/nube1.png');
        this.load.image('nube2', 'assets/nube2.png');
        this.load.image('tierra', 'assets/tierra.png'); // Cambia 'tierra.png' por el nombre de tu archivo
        this.load.image('piedra', 'assets/piedra.png'); // Reemplaza 'piedra.png' por el nombre de tu archivo
    }

    create() {
        const tileSize = 128;
        const gridSize = 100;

        this.cameras.main.setBounds(0, 0, gridSize * tileSize, gridSize * tileSize);
        this.cameras.main.setBackgroundColor('rgba(0, 0, 0, 0)'); // Fondo completamente transparente
        this.physics.world.setBounds(0, 0, gridSize * tileSize, gridSize * tileSize);

        this.grid = Array.from({ length: gridSize }, () =>
            Array.from({ length: gridSize }, () => ({ type: 'empty' }))
        );

        // Inicializar las filas de tierra y piedra
        for (let x = 0; x < gridSize; x++) {
            for (let y = 0; y < gridSize; y++) {
                if (y >= 3 && y <= 10) {
                    this.grid[x][y] = { type: 'tierra' }; // Fila de tierra
                } else if (y > 10) {
                    this.grid[x][y] = { type: 'piedra' }; // Fila de piedra
                }
            }
        }        

        // Crear cuadrículas
        for (let x = 0; x < gridSize; x++) {
            for (let y = 0; y < gridSize; y++) {
                let color;
                if (y < 3) {
                    color = 0x87CEEB; // Azul cielo
                } else if (y >= 3 && y <= 10) {
                    color = 0x8B4513; // Marrón tierra
                } else {
                    color = 0x444444; // Gris piedra
                }
                this.add.rectangle(x * tileSize, y * tileSize, tileSize, tileSize, color)
                    .setOrigin(0);
            }
        }
        this.tileSize = tileSize;

        const numNubes = 50; // Número de nubes
        const minSpeed = 3; // Velocidad mínima en píxeles/segundo
        const maxSpeed = 9; // Velocidad máxima en píxeles/segundo

        for (let i = 0; i < numNubes; i++) {
            const tipoNube = Phaser.Math.RND.pick(['nube1', 'nube2']); // Seleccionar aleatoriamente entre las dos nubes

            // Función para inicializar o reiniciar una nube con propiedades aleatorias
            const resetNube = (nube, isInitial = false) => {
                const maxScale = 0.25; // Escala máxima (altura de 2 celdas)
                const minScale = 0.1;  // Escala mínima
                const scale = Phaser.Math.FloatBetween(minScale, maxScale); // Escala aleatoria

                const nubeWidth = 1024 * scale; // Ancho real de la nube escalada
                const worldWidth = this.tileSize * gridSize; // Ancho total del mundo
                const startX = isInitial
                    ? Phaser.Math.Between(-nubeWidth, worldWidth) // Posición inicial aleatoria
                    : -nubeWidth; // Posición para regeneración (fuera del borde izquierdo)
                const endX = worldWidth; // Borde derecho del mundo
                const newY = Phaser.Math.Between(0, 3 * this.tileSize - 1024 * scale); // Posición Y dentro del cielo
                const speed = Phaser.Math.Between(minSpeed, maxSpeed); // Velocidad aleatoria
                const totalDistance = endX - startX; // Distancia total desde el inicio hasta el borde derecho
                const duration = (totalDistance / speed) * 1000; // Duración basada en la distancia y la velocidad

                nube.setScale(scale); // Aplicar nueva escala
                nube.y = newY; // Posicionar en el nuevo Y
                nube.x = startX; // Posición inicial aleatoria o borde izquierdo

                // Reiniciar la animación
                this.tweens.add({
                    targets: nube,
                    x: endX, // Mover al borde derecho
                    duration: duration, // Duración calculada según la velocidad constante
                    onComplete: () => resetNube(nube), // Llamar a esta misma función al completarse
                    repeat: 0, // No repetir automáticamente
                    yoyo: false // No regresar al punto inicial
                });
            };

            // Crear la nube
            const nube = this.add.image(0, 0, tipoNube).setOrigin(0);

            // Inicializar la nube con propiedades aleatorias (modo inicial)
            resetNube(nube, true);
        }

        for (let x = 0; x < gridSize; x++) {
            for (let y = 0; y < gridSize; y++) {
                if (this.grid[x][y].type === 'tierra' && y >= 3 && y <= 10) {
                    this.grid[x][y].sprite = this.add.image(x * this.tileSize, y * this.tileSize, 'tierra')
                        .setOrigin(0)
                        .setDisplaySize(this.tileSize, this.tileSize);
                } else if (this.grid[x][y].type === 'piedra' && y > 10) {
                    this.grid[x][y].sprite = this.add.image(x * this.tileSize, y * this.tileSize, 'piedra')
                        .setOrigin(0)
                        .setDisplaySize(this.tileSize, this.tileSize);
                }
            }
        }


        // Añadir el personaje
        this.player = this.physics.add.sprite(2 * this.tileSize, 2 * this.tileSize, 'personaje').setOrigin(0);
        this.player.displayWidth = this.tileSize; // Ajustar ancho al tamaño de la cuadrícula
        this.player.displayHeight = this.tileSize; // Ajustar alto al tamaño de la cuadrícula
        this.player.setCollideWorldBounds(true);

        this.cameras.main.startFollow(this.player);

        this.cursors = this.input.keyboard.createCursorKeys();
    }

    update() {
        if (this.moving) {
            return; // No permitir nuevos movimientos mientras esté en curso
        }

        const tileSize = this.tileSize;

        // Iniciar movimiento en la dirección adecuada
        if (this.cursors.left.isDown) {
            this.startMovement(-tileSize, 0);
        } else if (this.cursors.right.isDown) {
            this.startMovement(tileSize, 0);
        } else if (this.cursors.up.isDown) {
            this.startMovement(0, -tileSize);
        } else if (this.cursors.down.isDown) {
            this.startMovement(0, tileSize);
        }
    }

    startMovement(dx, dy) {
        this.moving = true; // Bloquear nuevos movimientos
        const targetX = this.player.x + dx;
        const targetY = this.player.y + dy;

        // Animar el movimiento hacia la celda objetivo
        this.tweens.add({
            targets: this.player,
            x: targetX,
            y: targetY,
            duration: 200, // Duración del movimiento (en ms)
            onComplete: () => {
                const gridX = Math.floor(targetX / this.tileSize);
                const gridY = Math.floor(targetY / this.tileSize);

                // Identificar el tipo de celda y actuar en consecuencia
                if (this.grid[gridX][gridY].type === 'tierra') {
                    this.triggerEffect('tierra'); // Activar efecto para tierra
                    this.grid[gridX][gridY].type = 'empty';

                    if (this.grid[gridX][gridY].sprite) {
                        this.grid[gridX][gridY].sprite.destroy();
                        this.grid[gridX][gridY].sprite = null;
                    }
                } else if (this.grid[gridX][gridY].type === 'piedra') {
                    this.triggerEffect('piedra'); // Activar efecto para piedra
                    this.grid[gridX][gridY].type = 'empty';

                    if (this.grid[gridX][gridY].sprite) {
                        this.grid[gridX][gridY].sprite.destroy();
                        this.grid[gridX][gridY].sprite = null;
                    }
                } else {
                    console.log('Esta celda ya está vacía.');
                }

                // Siempre liberar el movimiento después de cualquier acción
                this.moving = false;
                this.update(); // Verificar si la tecla sigue presionada
            }
        });
    }

    triggerEffect(type) {
        if (type === 'tierra') {
            console.log('Efecto: Minero pica tierra');
            // Eliminamos el cambio de color
        } else if (type === 'piedra') {
            console.log('Efecto: Minero pica piedra');
            // Eliminamos el cambio de color
        }
    }
}

const config = {
    type: Phaser.AUTO,
    width: window.innerWidth, // Ancho dinámico según el tamaño de la ventana
    height: window.innerHeight, // Alto dinámico según el tamaño de la ventana
    physics: {
        default: 'arcade',
        arcade: {
            gravity: { y: 0 },
            debug: false
        }
    },
    scene: [MenuScene, GameScene] // Incluir ambas escenas
};

const game = new Phaser.Game(config);

// Redimensionar el lienzo cuando se cambie el tamaño de la ventana
window.addEventListener('resize', () => {
    game.scale.resize(window.innerWidth, window.innerHeight);
});