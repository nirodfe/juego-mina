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

        // Centrar el título con el nuevo nombre
        this.add.text(
            this.cameras.main.width / 2, // Centrar en el eje X
            this.cameras.main.height / 3 + 20, // Mantener la misma altura
            'Miner Madness', // El nuevo título del juego
            { fontSize: '48px', fill: '#000', fontStyle: 'bold' } // Color crema y estilo en negrita
        ).setOrigin(0.5);

        // Centrar el botón con estilo negro y marrón al pasar el cursor
        const boton = this.add.text(
            this.cameras.main.width / 2 - 15, // Mover hacia la izquierda
            this.cameras.main.height / 2 + 30, // Mantener la misma altura
            'JUGAR', // Texto cambiado a "JUGAR"
            { fontSize: '32px', fill: '#000', fontStyle: 'bold' } // Botón en negro y estilo en negrita
        )
            .setOrigin(0.5)
            .setInteractive()
            .on('pointerdown', () => this.scene.start('GameScene')) // Cambiar a la escena del juego
            .on('pointerover', () => boton.setStyle({ fill: '#8b4513' })) // Cambiar a marrón al pasar el mouse
            .on('pointerout', () => boton.setStyle({ fill: '#000' })); // Restaurar negro al quitar el cursor

        // Añadir el cartel con tu nombre en color crema
        this.add.text(
            this.cameras.main.width / 2, // Centrado en X
            this.cameras.main.height / 2 + 80, // Posicionar debajo del botón
            'Hecho por: Nicolás Rodríguez Ferrándiz',
            { fontSize: '24px', fill: '#f5deb3', fontStyle: 'bold' } // Color crema y estilo en negrita
        ).setOrigin(0.5);
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
        this.load.image('tierraHierba', 'assets/tierraHierba.png');
        this.load.image('mochila', 'assets/mochila.png'); // Cambia 'mochila.png' por el nombre real del archivo
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
                if (y === 3) { // Fila número 4
                    this.grid[x][y].sprite = this.add.image(x * this.tileSize, y * this.tileSize, 'tierraHierba')
                        .setOrigin(0)
                        .setDisplaySize(this.tileSize, this.tileSize);
                } else if (y >= 4 && y <= 10) { // Otras filas de tierra
                    this.grid[x][y].sprite = this.add.image(x * this.tileSize, y * this.tileSize, 'tierra')
                        .setOrigin(0)
                        .setDisplaySize(this.tileSize, this.tileSize);
                } else if (y > 10) { // Filas de piedra y carbón
                    if (this.grid[x][y].type === 'carbon') {
                        // Dibujar bloque de carbón
                        this.grid[x][y].sprite = this.add.image(x * this.tileSize, y * this.tileSize, 'carbon')
                            .setOrigin(0)
                            .setDisplaySize(this.tileSize, this.tileSize);
                    } else {
                        // Dibujar bloque de piedra
                        this.grid[x][y].sprite = this.add.image(x * this.tileSize, y * this.tileSize, 'piedra')
                            .setOrigin(0)
                            .setDisplaySize(this.tileSize, this.tileSize);
                    }
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

        // Tamaño deseado del botón
        const buttonSize = 64;

        // Crear el menú de la mochila (oculto al principio)
        this.menuContainer = this.add.container(0, 0).setVisible(false);

        // Fondo del menú que cubre toda la pantalla visible
        const menuBackground = this.add.rectangle(
            0, 0,
            this.cameras.main.width, // Ancho igual al ancho visible de la cámara
            this.cameras.main.height, // Alto igual al alto visible de la cámara
            0x000000,
            0.8 // Opacidad del fondo
        )
            .setOrigin(0.5)
            .setInteractive(); // Fondo interactivo para bloquear clics en el juego
        this.menuContainer.add(menuBackground);

        // Texto del título del menú (centrado en la pantalla)
        const menuTitle = this.add.text(
            0, // Centrado horizontalmente respecto al fondo
            -this.cameras.main.height / 4, // Centrado verticalmente, ligeramente hacia arriba
            'Mochila',
            {
                fontSize: '48px',
                fill: '#ffffff',
                fontStyle: 'bold'
            }
        ).setOrigin(0.5);
        this.menuContainer.add(menuTitle);

        // Estadísticas dentro del menú (centradas dinámicamente)
        this.carbonText = this.add.text(
            0, 0, // Centrado horizontalmente y verticalmente
            'Carbón: 0',
            {
                fontSize: '32px',
                fill: '#ffffff'
            }
        ).setOrigin(0.5);
        this.mineralText = this.add.text(
            0, this.cameras.main.height / 8, // Centrado horizontalmente y un poco más abajo
            'Minerales: 0',
            {
                fontSize: '32px',
                fill: '#ffffff'
            }
        ).setOrigin(0.5);
        this.menuContainer.add([this.carbonText, this.mineralText]);

        // Añadir el botón de la mochila
        const mochilaButton = this.add.image(
            this.cameras.main.width - buttonSize / 2 - 16, // Posición inicial en X
            buttonSize / 2 + 16, // Posición inicial en Y
            'mochila' // Imagen del botón
        )
            .setOrigin(0.5)
            .setInteractive({ useHandCursor: true }) // Hacer que sea interactivo y cambiar el cursor al pasar
            .setDisplaySize(buttonSize, buttonSize)
            .setScrollFactor(0) // Fijar el botón a la cámara para que no se mueva con el mundo
            .setDepth(1); // Asegurarse de que el botón esté por encima del menú

        // Mostrar/ocultar el menú centrado en la cámara
        mochilaButton.on('pointerdown', () => {
            if (this.menuContainer.visible) {
                // Cerrar el menú y reanudar el juego
                this.menuContainer.setVisible(false);
                this.physics.world.resume(); // Reanudar el mundo físico
                this.input.keyboard.enabled = true; // Reactivar entradas
            } else {
                // Centramos el menú en el centro de la cámara visible
                this.menuContainer.setPosition(
                    this.cameras.main.scrollX + this.cameras.main.width / 2, // Centro horizontal visible
                    this.cameras.main.scrollY + this.cameras.main.height / 2 // Centro vertical visible
                );

                // Ajustar el tamaño del fondo dinámicamente al área visible
                menuBackground.setSize(this.cameras.main.width, this.cameras.main.height);

                // Mostrar el menú y pausar el juego
                this.menuContainer.setVisible(true);
                this.physics.world.pause(); // Pausar el mundo físico
                this.input.keyboard.enabled = false; // Desactivar entradas
            }
        });
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
        // Movimiento hacia arriba
        else if (this.cursors.up.isDown) {
            if (this.player.y > 0) { // No salir del límite superior
                this.startMovement(0, -tileSize);
            }
        }
        // Movimiento hacia abajo
        else if (this.cursors.down.isDown) {
            if (this.player.y < this.physics.world.bounds.height - tileSize) { // No salir del límite inferior
                this.startMovement(0, tileSize);
            }
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