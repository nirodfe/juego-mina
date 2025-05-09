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
        this.load.image('tierra', 'assets/tierra.png'); // Textura de tierra
        this.load.image('piedra', 'assets/piedra.png'); // Textura de piedra
        this.load.image('carbon', 'assets/carbon.png'); // Textura de carbón
    }

    create() {
        const tileSize = 128;
        const gridSize = 100;

        this.cameras.main.setBounds(0, 0, gridSize * tileSize, gridSize * tileSize);
        this.cameras.main.setBackgroundColor('rgba(0, 0, 0, 0)'); // Fondo completamente transparente
        this.physics.world.setBounds(0, 0, gridSize * tileSize, gridSize * tileSize);
        // Crear un grupo de colisiones para los bloques
        this.collisionGroup = this.physics.add.staticGroup();


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

        // Distribuir aleatoriamente 750 bloques de carbón en la zona de piedra
        let carbonCount = 750;
        while (carbonCount > 0) {
            const x = Phaser.Math.Between(0, gridSize - 1); // Coordenada X aleatoria
            const y = Phaser.Math.Between(11, gridSize - 1); // Coordenada Y aleatoria (zona de piedra)

            if (this.grid[x][y].type === 'piedra') {
                this.grid[x][y].type = 'carbon'; // Cambiar el tipo a carbón
                carbonCount--;
            }
        }

        console.log('Distribución de carbón completa.');

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

                this.tweens.add({
                    targets: nube,
                    x: endX, // Mover al borde derecho
                    duration: duration, // Duración calculada según la velocidad constante
                    onComplete: () => resetNube(nube), // Llamar a esta misma función al completarse
                    repeat: 0, // No repetir automáticamente
                    yoyo: false // No regresar al punto inicial
                });
            };

            const nube = this.add.image(0, 0, tipoNube).setOrigin(0);
            resetNube(nube, true);
        }

        for (let x = 0; x < gridSize; x++) {
            for (let y = 0; y < gridSize; y++) {
                if (this.grid[x][y].type === 'tierra' && y >= 3 && y <= 10) {
                    this.grid[x][y].sprite = this.collisionGroup.create(
                        x * this.tileSize + this.tileSize / 2, // Centrar en el bloque
                        y * this.tileSize + this.tileSize / 2,
                        'tierra'
                    )
                        .setOrigin(0.5)
                        .setDisplaySize(this.tileSize, this.tileSize);
                } else if (this.grid[x][y].type === 'piedra' && y > 10) {
                    this.grid[x][y].sprite = this.collisionGroup.create(
                        x * this.tileSize + this.tileSize / 2,
                        y * this.tileSize + this.tileSize / 2,
                        'piedra'
                    )
                        .setOrigin(0.5)
                        .setDisplaySize(this.tileSize, this.tileSize);
                } else if (this.grid[x][y].type === 'carbon') {
                    this.grid[x][y].sprite = this.collisionGroup.create(
                        x * this.tileSize + this.tileSize / 2,
                        y * this.tileSize + this.tileSize / 2,
                        'carbon'
                    )
                        .setOrigin(0.5)
                        .setDisplaySize(this.tileSize, this.tileSize);
                }
            }
        }        

        // Añadir el personaje
        this.player = this.physics.add.sprite(2 * this.tileSize, 2 * this.tileSize, 'personaje').setOrigin(0);
        this.player.displayWidth = this.tileSize; // Ajustar ancho al tamaño de la cuadrícula
        this.player.displayHeight = this.tileSize; // Ajustar alto al tamaño de la cuadrícula
        this.player.setCollideWorldBounds(true);
        this.player.body.allowGravity = true; // Habilitar la gravedad en el personaje
        this.physics.add.collider(this.player, this.collisionGroup);

        this.cameras.main.startFollow(this.player);

        this.cursors = this.input.keyboard.createCursorKeys();
    }

    update() {
        const tileSize = this.tileSize; // Tamaño de un bloque (128 en este caso)

        if (this.moving) {
            return; // No permitir nuevos movimientos mientras el personaje está en movimiento
        }

        // Movimiento a la izquierda
        if (this.cursors.left.isDown) {
            if (this.player.x > 0) { // No salir del límite izquierdo
                this.startMovement(-tileSize, 0);
            }
        }
        // Movimiento a la derecha
        else if (this.cursors.right.isDown) {
            if (this.player.x < this.physics.world.bounds.width - tileSize) { // No salir del límite derecho
                this.startMovement(tileSize, 0);
            }
        }
        // Movimiento hacia abajo
        else if (this.cursors.down.isDown) {
            if (this.player.y < this.physics.world.bounds.height - tileSize) { // No salir del límite inferior
                this.startMovement(0, tileSize);
            }
        }

        // Salto
        if (this.cursors.up.isDown && this.player.body.blocked.down) {
            this.player.setVelocityY(-350); // Ajusta este valor para controlar la altura y velocidad del salto
        }
    }

    // Método para iniciar el movimiento bloque por bloque
    startMovement(dx, dy) {
        this.moving = true; // Bloquear nuevos movimientos mientras se realiza el actual

        const targetX = this.player.x + dx; // Nueva posición X
        const targetY = this.player.y + dy; // Nueva posición Y

        // Animar el movimiento hacia el nuevo bloque
        this.tweens.add({
            targets: this.player,
            x: targetX,
            y: targetY,
            duration: 200, // Ajusta la duración del movimiento si es necesario
            onComplete: () => {
                this.moving = false; // Permitir nuevos movimientos una vez completado
            }
        });

        // Verificar y vaciar el bloque al que se mueve el personaje
        const gridX = Math.floor(targetX / this.tileSize);
        const gridY = Math.floor(targetY / this.tileSize);

        if (this.grid[gridX] && this.grid[gridX][gridY]) {
            if (this.grid[gridX][gridY].type === 'tierra' || this.grid[gridX][gridY].type === 'piedra' || this.grid[gridX][gridY].type === 'carbon') {
                this.grid[gridX][gridY].type = 'empty'; // Vaciar la celda
                if (this.grid[gridX][gridY].sprite) {
                    this.grid[gridX][gridY].sprite.destroy(); // Destruir el sprite del bloque
                    this.grid[gridX][gridY].sprite = null;
                }
            }
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
                    this.grid[gridX][gridY].type = 'empty';

                    if (this.grid[gridX][gridY].sprite) {
                        this.grid[gridX][gridY].sprite.destroy();
                        this.grid[gridX][gridY].sprite = null;
                    }
                } else if (this.grid[gridX][gridY].type === 'piedra') {
                    this.grid[gridX][gridY].type = 'empty';

                    if (this.grid[gridX][gridY].sprite) {
                        this.grid[gridX][gridY].sprite.destroy();
                        this.grid[gridX][gridY].sprite = null;
                    }
                } else if (this.grid[gridX][gridY].type === 'carbon') {
                    // Lógica para vaciar el carbón
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
            gravity: { y: 500 },
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