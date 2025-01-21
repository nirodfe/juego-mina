class MenuScene extends Phaser.Scene {
    constructor() {
        super('MenuScene');
    }

    preload() { }

    create() {
        this.add.text(400, 200, 'Juego Mina', { fontSize: '48px', fill: '#fff' }).setOrigin(0.5);

        const boton = this.add.text(400, 300, 'Iniciar Juego', { fontSize: '32px', fill: '#0f0' })
            .setOrigin(0.5)
            .setInteractive()
            .on('pointerdown', () => this.scene.start('GameScene'))
            .on('pointerover', () => boton.setStyle({ fill: '#ff0' }))
            .on('pointerout', () => boton.setStyle({ fill: '#0f0' }));
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

        // Crear cuadrículas
        for (let x = 0; x < gridSize; x++) {
            for (let y = 0; y < gridSize; y++) {
                let color;
                if (y < 3) {
                    color = 0x87CEEB; // Azul cielo
                } else if (y >= 3 && y <= 39) {
                    color = 0x8B4513; // Marrón tierra
                } else {
                    color = 0x444444; // Gris piedra
                }
                this.add.rectangle(x * tileSize, y * tileSize, tileSize, tileSize, color)
                    .setOrigin(0)
                    //.setStrokeStyle(1, 0xffffff); // Añade bordes blancos
            }
        }
        this.tileSize = tileSize;

        const numNubes = 50; // Número de nubes
        for (let i = 0; i < numNubes; i++) {
            const tipoNube = Phaser.Math.RND.pick(['nube1', 'nube2']); // Seleccionar aleatoriamente entre las dos nubes

            const maxScale = 0.25; // Escala máxima (altura de 2 celdas)
            const minScale = 0.1;  // Escala mínima
            const scale = Phaser.Math.FloatBetween(minScale, maxScale); // Escala aleatoria

            const nubeWidth = 1024 * scale; // Ancho real de la nube escalada
            const worldWidth = this.tileSize * gridSize; // Ancho total del mundo
            const maxX = worldWidth - nubeWidth; // Limitar posición X
            const x = Phaser.Math.Between(0, maxX); // Posición X aleatoria

            const nubeHeight = 1024 * scale; // Altura real de la nube escalada
            const maxY = (3 * this.tileSize) - nubeHeight; // Altura máxima permitida
            const y = Phaser.Math.Between(0, maxY); // Posición Y aleatoria dentro del rango

            const nube = this.add.image(x, y, tipoNube).setOrigin(0);
            nube.setScale(scale); // Aplicar escala aleatoria
        }

        for (let x = 0; x < gridSize; x++) {
            for (let y = 3; y <= 39; y++) { // Solo filas de tierra
                this.add.image(x * this.tileSize, y * this.tileSize, 'tierra')
                    .setOrigin(0)
                    .setDisplaySize(this.tileSize, this.tileSize); // Ajustar la textura al tamaño de la celda
            }
        }

        for (let x = 0; x < gridSize; x++) {
            for (let y = 40; y < gridSize; y++) { // Solo filas de piedra
                this.add.image(x * this.tileSize, y * this.tileSize, 'piedra')
                    .setOrigin(0)
                    .setDisplaySize(this.tileSize, this.tileSize); // Ajustar la textura al tamaño de la celda
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
                this.moving = false; // Permitir nuevos movimientos
                this.update(); // Verificar si la tecla sigue presionada
            }
        });
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