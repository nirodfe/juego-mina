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

    preload() {}

    create() {
        const tileSize = 32;
        const gridSize = 100;

        this.cameras.main.setBounds(0, 0, gridSize * tileSize, gridSize * tileSize);
        this.physics.world.setBounds(0, 0, gridSize * tileSize, gridSize * tileSize);

        // Crear cuadrículas visibles cerca del personaje
        for (let x = 0; x < gridSize; x++) {
            for (let y = 0; y < gridSize; y++) {
                if (x < 10 && y < 10) {
                    this.add.rectangle(x * tileSize, y * tileSize, tileSize, tileSize, 0x444444)
                        .setOrigin(0)
                        .setStrokeStyle(1, 0xffffff);
                }
            }
        }

        this.tileSize = tileSize;

        // Añadir el personaje
        this.player = this.physics.add.sprite(5 * tileSize, 5 * tileSize, null).setOrigin(0.5);
        this.player.displayWidth = tileSize;
        this.player.displayHeight = tileSize;
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
    width: 800,
    height: 600,
    physics: {
        default: 'arcade',
        arcade: {
            gravity: { y: 0 },
            debug: false
        }
    },
    scene: [MenuScene, GameScene]
};

const game = new Phaser.Game(config);