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
        this.load.image('cobre', 'assets/cobre.png'); // Asegúrate de que esta línea esté en preload
        this.load.image('hierro', 'assets/hierro.png'); // Cambia el nombre del archivo a tu textura de hierro
        this.load.image('plata', 'assets/plata.png'); // Cambia 'plata.png' por el nombre correcto del archivo
        this.load.image('oro', 'assets/oro.png'); // Cambia 'assets/oro.png' por la ruta de tu textura de oro
        this.load.image('rubi', 'assets/rubi.png'); // Cambia el nombre del archivo por el correcto
        this.load.image('esmeralda', 'assets/esmeralda.png'); // Cambia el nombre del archivo por el correcto
        this.load.image('diamante', 'assets/diamante.png'); // Cambia el nombre del archivo por el correcto
        this.load.audio('sonido1', 'assets/sonido1.mp3');
        this.load.audio('sonido2', 'assets/sonido2.mp3');
        this.load.audio('sonido3', 'assets/sonido3.mp3');
        this.load.audio('sonido4', 'assets/sonido4.mp3');
        this.load.image('ladder', 'assets/escalera.png'); // Ajusta la ruta si es diferente
    }

    create() {
        const tileSize = 128;
        const gridSize = 175;

        // Configurar la tecla de espacio
        this.spaceKey = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.SPACE);

        this.sounds = [
            this.sound.add('sonido1'),
            this.sound.add('sonido2'),
            this.sound.add('sonido3'),
            this.sound.add('sonido4')
        ];
        this.currentSoundIndex = 0;

        // Iniciar la reproducción en bucle
        this.playNextSound()

        this.cameras.main.setBounds(0, 0, gridSize * tileSize, gridSize * tileSize);
        this.cameras.main.setBackgroundColor('rgba(0, 0, 0, 0)'); // Fondo completamente transparente
        this.physics.world.setBounds(0, 0, gridSize * tileSize, gridSize * tileSize);

        this.grid = Array.from({ length: gridSize }, () =>
            Array.from({ length: gridSize }, () => ({ type: 'empty' }))
        );

        // Inicializar las filas de tierra y piedra
        for (let x = 0; x < gridSize; x++) {
            for (let y = 0; y < gridSize; y++) {
                if (y >= 3 && y <= 5) {
                    this.grid[x][y] = { type: 'tierra' }; // Fila de tierra
                } else if (y > 5) {
                    this.grid[x][y] = { type: 'piedra' }; // Fila de piedra
                }
            }
        }

        let carbonCount = 900;
        while (carbonCount > 0) {
            const x = Phaser.Math.Between(0, gridSize - 1); // Coordenada X aleatoria
            const y = Phaser.Math.Between(6, gridSize - 1); // Coordenada Y aleatoria (zona de piedra)

            if (this.grid[x][y].type === 'piedra') {
                this.grid[x][y].type = 'carbon'; // Cambiar el tipo a carbón
                carbonCount--;
            }
        }

        let cobreCount = 800;
        while (cobreCount > 0) {
            const x = Phaser.Math.Between(0, gridSize - 1); // Coordenada X aleatoria
            const y = Phaser.Math.Between(6, gridSize - 1); // Coordenada Y aleatoria (zona de piedra)

            if (this.grid[x][y].type === 'piedra') {
                this.grid[x][y].type = 'cobre'; // Cambiar el tipo a cobre
                cobreCount--;
            }
        }

        let hierroCount = 700; // Cantidad de bloques de hierro
        while (hierroCount > 0) {
            const x = Phaser.Math.Between(0, gridSize - 1); // Coordenada X aleatoria
            const y = Phaser.Math.Between(11, gridSize - 1); // Coordenada Y aleatoria (zona de piedra)

            if (this.grid[x][y].type === 'piedra') {
                this.grid[x][y].type = 'hierro'; // Cambiar el tipo a hierro
                hierroCount--;
            }
        }

        let plataCount = 600; // Cantidad de bloques de plata
        while (plataCount > 0) {
            const x = Phaser.Math.Between(0, gridSize - 1); // Coordenada X aleatoria
            const y = Phaser.Math.Between(6, gridSize - 1); // Coordenada Y aleatoria (zona de piedra)

            if (this.grid[x][y].type === 'piedra') {
                this.grid[x][y].type = 'plata'; // Cambiar el tipo a plata
                plataCount--;
            }
        }

        let oroCount = 500; // Cantidad de bloques de oro
        while (oroCount > 0) {
            const x = Phaser.Math.Between(0, gridSize - 1); // Coordenada X aleatoria
            const y = Phaser.Math.Between(6, gridSize - 1); // Coordenada Y aleatoria (zona de piedra)

            if (this.grid[x][y].type === 'piedra') {
                this.grid[x][y].type = 'oro'; // Cambiar el tipo a oro
                oroCount--;
            }
        }

        let rubiCount = 350; // Cantidad de bloques de rubí
        while (rubiCount > 0) {
            const x = Phaser.Math.Between(0, gridSize - 1); // Coordenada X aleatoria
            const y = Phaser.Math.Between(6, gridSize - 1); // Coordenada Y aleatoria (zona de piedra)

            if (this.grid[x][y].type === 'piedra') {
                this.grid[x][y].type = 'rubi'; // Cambiar el tipo a rubí
                rubiCount--;
            }
        }

        let esmeraldaCount = 250; // Cantidad de bloques de esmeralda
        while (esmeraldaCount > 0) {
            const x = Phaser.Math.Between(0, gridSize - 1); // Coordenada X aleatoria
            const y = Phaser.Math.Between(6, gridSize - 1); // Coordenada Y aleatoria (zona de piedra)

            if (this.grid[x][y].type === 'piedra') {
                this.grid[x][y].type = 'esmeralda'; // Cambiar el tipo a esmeralda
                esmeraldaCount--;
            }
        }

        let diamanteCount = 100; // Cantidad de bloques de diamante
        while (diamanteCount > 0) {
            const x = Phaser.Math.Between(0, gridSize - 1); // Coordenada X aleatoria
            const y = Phaser.Math.Between(6, gridSize - 1); // Coordenada Y aleatoria (zona de piedra)

            if (this.grid[x][y].type === 'piedra') {
                this.grid[x][y].type = 'diamante'; // Cambiar el tipo a diamante
                diamanteCount--;
            }
        }

        // Crear cuadrículas
        for (let x = 0; x < gridSize; x++) {
            for (let y = 0; y < gridSize; y++) {
                let color;
                if (y < 3) {
                    color = 0x87CEEB; // Azul cielo
                } else if (y >= 3 && y <= 5) {
                    color = 0x8B4513; // Marrón tierra
                } else {
                    color = 0x444444; // Gris piedra
                }
                this.add.rectangle(x * tileSize, y * tileSize, tileSize, tileSize, color)
                    .setOrigin(0);
            }
        }
        this.tileSize = tileSize;

        const numNubes = 75; // Número de nubes
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
                } else if (y >= 4 && y <= 5) { // Otras filas de tierra
                    this.grid[x][y].sprite = this.add.image(x * this.tileSize, y * this.tileSize, 'tierra')
                        .setOrigin(0)
                        .setDisplaySize(this.tileSize, this.tileSize);
                } else if (y > 5) { // Filas de piedra y carbón
                    if (this.grid[x][y].type === 'carbon') {
                        // Dibujar fondo de piedra
                        this.grid[x][y].baseSprite = this.add.image(x * this.tileSize, y * this.tileSize, 'piedra')
                            .setOrigin(0)
                            .setDisplaySize(this.tileSize, this.tileSize);

                        // Dibujar capa de carbón encima
                        this.grid[x][y].overlaySprite = this.add.image(x * this.tileSize, y * this.tileSize, 'carbon')
                            .setOrigin(0)
                            .setDisplaySize(this.tileSize, this.tileSize);
                    } else if (this.grid[x][y].type === 'cobre') {
                        // Dibujar bloque de cobre
                        this.grid[x][y].sprite = this.add.image(x * this.tileSize, y * this.tileSize, 'cobre')
                            .setOrigin(0)
                            .setDisplaySize(this.tileSize, this.tileSize);
                    } else if (this.grid[x][y].type === 'hierro') {
                        // Dibujar bloque de hierro
                        this.grid[x][y].sprite = this.add.image(x * this.tileSize, y * this.tileSize, 'hierro')
                            .setOrigin(0)
                            .setDisplaySize(this.tileSize, this.tileSize);
                    } else if (this.grid[x][y].type === 'plata') {
                        // Dibujar bloque de plata
                        this.grid[x][y].sprite = this.add.image(x * this.tileSize, y * this.tileSize, 'plata')
                            .setOrigin(0)
                            .setDisplaySize(this.tileSize, this.tileSize);
                    } else if (this.grid[x][y].type === 'oro') {
                        // Dibujar bloque de oro
                        this.grid[x][y].sprite = this.add.image(x * this.tileSize, y * this.tileSize, 'oro')
                            .setOrigin(0)
                            .setDisplaySize(this.tileSize, this.tileSize);
                    } else if (this.grid[x][y].type === 'rubi') { // Nueva lógica para el rubí
                        this.grid[x][y].sprite = this.add.image(x * this.tileSize, y * this.tileSize, 'rubi')
                            .setOrigin(0)
                            .setDisplaySize(this.tileSize, this.tileSize);
                    } else if (this.grid[x][y].type === 'esmeralda') {
                        // Dibujar bloque de esmeralda
                        this.grid[x][y].sprite = this.add.image(x * this.tileSize, y * this.tileSize, 'esmeralda')
                            .setOrigin(0)
                            .setDisplaySize(this.tileSize, this.tileSize);
                    } else if (this.grid[x][y].type === 'diamante') {
                        // Dibujar bloque de diamante
                        this.grid[x][y].sprite = this.add.image(x * this.tileSize, y * this.tileSize, 'diamante')
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
        this.player = this.physics.add.sprite(2 * this.tileSize, 2 * this.tileSize, 'personaje')
            .setOrigin(0)
            .setDepth(5); // Profundidad correcta para estar debajo del menú pero sobre otros elementos
        this.player.displayWidth = this.tileSize; // Ajustar ancho al tamaño de la cuadrícula
        this.player.displayHeight = this.tileSize; // Ajustar alto al tamaño de la cuadrícula
        this.player.setCollideWorldBounds(true);

        this.cameras.main.startFollow(this.player);

        this.cursors = this.input.keyboard.createCursorKeys();
        this.spaceKey = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.SPACE);

        // Tamaño deseado del botón
        const buttonSize = 100;

        // Crear el menú de la mochila (oculto al principio)
        this.menuContainer = this.add.container(0, 0).setVisible(false).setDepth(15); // Establecer profundidad alta para el menú

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

        this.carbonCount = 0; // Inicializar contador de carbón recolectado

        // Estadísticas dentro del menú (centradas dinámicamente)
        this.carbonText = this.add.text(
            0, -100, // Ligeramente por encima del centro
            'Carbón: 0',
            {
                fontSize: '32px',
                fill: '#ffffff'
            }
        ).setOrigin(0.5);

        this.cobreCount = 0; // Contador de cobre

        this.cobreText = this.add.text(
            0, -50, // Ligeramente por debajo del centro
            'Cobre: 0',
            {
                fontSize: '32px',
                fill: '#ffffff'
            }
        ).setOrigin(0.5);

        this.hierroCount = 0; // Inicializar contador de hierro

        this.hierroText = this.add.text(
            0, 0, // Ajustar posición debajo de los otros textos
            'Hierro: 0',
            {
                fontSize: '32px',
                fill: '#ffffff'
            }
        ).setOrigin(0.5);

        this.plataCount = 0; // Inicializar contador de plata

        this.plataText = this.add.text(
            0, 50, // Ligeramente por debajo del texto de cobre
            'Plata: 0',
            {
                fontSize: '32px',
                fill: '#ffffff'
            }
        ).setOrigin(0.5);

        this.oroCount = 0; // Inicializar contador de oro

        this.oroText = this.add.text(
            0, 100, // Ajusta la posición vertical según sea necesario
            'Oro: 0',
            {
                fontSize: '32px',
                fill: '#ffffff'
            }
        ).setOrigin(0.5);

        this.rubiCount = 0; // Inicializar contador de rubí

        this.rubiText = this.add.text(
            0, 150, // Ajusta la posición según tu diseño
            'Rubí: 0',
            {
                fontSize: '32px',
                fill: '#ffffff'
            }
        ).setOrigin(0.5);

        this.esmeraldaCount = 0; // Inicializar contador de esmeraldas

        this.esmeraldaText = this.add.text(
            0, 200, // Ajusta la posición según tu diseño
            'Esmeralda: 0',
            {
                fontSize: '32px',
                fill: '#ffffff'
            }
        ).setOrigin(0.5);

        this.diamanteCount = 0; // Inicializar contador de diamantes

        this.diamanteText = this.add.text(
            0, 250, // Ajusta la posición según tu diseño
            'Diamantes: 0',
            {
                fontSize: '32px',
                fill: '#ffffff'
            }
        ).setOrigin(0.5);

        // Añadir el texto de diamantes al contenedor del menú
        this.menuContainer.add(this.diamanteText);

        // Añadir el texto de esmeraldas al contenedor del menú
        this.menuContainer.add(this.esmeraldaText);

        // Añade este texto al contenedor del menú
        this.menuContainer.add(this.rubiText);

        // Añadir el texto al contenedor del menú
        this.menuContainer.add(this.oroText);

        // Añadir el texto de plata al contenedor del menú
        this.menuContainer.add(this.plataText);

        this.menuContainer.add(this.hierroText); // Añadir al contenedor del menú


        // Añadir los textos deseados al contenedor del menú
        this.menuContainer.add([this.carbonText, this.cobreText]);

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
            .setDepth(15); // Asegurarse de que el botón esté por encima del menú

        mochilaButton.on('pointerdown', () => {
            if (this.menuContainer.visible) {
                // Cerrar el menú
                this.menuContainer.setVisible(false);
                this.physics.world.resume(); // Reanudar el mundo físico
                this.input.keyboard.enabled = true; // Reactivar entradas del teclado
                this.cameras.main.startFollow(this.player); // Volver a seguir al jugador
                this.input.keyboard.resetKeys(); // Reiniciar teclas
                this.player.setVelocity(0, 0); // Detener cualquier movimiento residual
                this.moving = false; // Reiniciar el estado de movimiento
            } else {
                // Abrir el menú
                this.player.setVelocity(0, 0); // Detener movimiento físico
                this.moving = false; // Resetear el estado de movimiento

                this.menuContainer.setPosition(
                    this.cameras.main.scrollX + this.cameras.main.width / 2,
                    this.cameras.main.scrollY + this.cameras.main.height / 2
                );

                menuBackground.setSize(this.cameras.main.width, this.cameras.main.height);

                this.menuContainer.setVisible(true); // Mostrar el menú
                this.physics.world.pause(); // Pausar el mundo físico
                this.input.keyboard.enabled = false; // Desactivar entradas del teclado
                this.cameras.main.stopFollow(); // Detener el seguimiento de la cámara
                this.input.keyboard.resetKeys(); // Reiniciar teclas
            }
        });
    }

    update() {

        // Si el menú está abierto, detener el personaje y no permitir acciones
        if (this.menuContainer.visible) {
            this.player.setVelocity(0, 0); // Detener cualquier movimiento físico
            this.moving = false; // Reiniciar el estado de movimiento
            return; // Salir del método update mientras el menú esté abierto
        }

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
            const gridX = Math.floor(this.player.x / tileSize); // Posición del jugador en la cuadrícula X
            const gridY = Math.floor(this.player.y / tileSize); // Posición del jugador en la cuadrícula Y

            // Solo permitir subir si hay una escalera en la celda actual
            if (this.grid[gridX] && this.grid[gridX][gridY] && this.grid[gridX][gridY].type === 'ladder') {
                if (this.player.y > 0) { // No salir del límite superior
                    this.startMovement(0, -tileSize);
                }
            }
        }
        // Movimiento hacia abajo
        else if (this.cursors.down.isDown) {
            if (this.player.y < this.physics.world.bounds.height - tileSize) { // No salir del límite inferior
                this.startMovement(0, tileSize);
            }
        }

        // Lógica para colocar escaleras
        const gridX = Math.floor(this.player.x / tileSize); // Posición del jugador en la cuadrícula X
        const gridY = Math.floor(this.player.y / tileSize); // Posición del jugador en la cuadrícula Y

        if (Phaser.Input.Keyboard.JustDown(this.spaceKey)) {
            if (gridY >= 3 && this.grid[gridX] && this.grid[gridX][gridY] && this.grid[gridX][gridY].type === 'empty') {
                // Colocar una escalera
                this.grid[gridX][gridY].type = 'ladder'; // Cambiar el tipo del bloque
                this.grid[gridX][gridY].sprite = this.add.image(gridX * tileSize, gridY * tileSize, 'ladder')
                    .setOrigin(0)
                    .setDisplaySize(tileSize, tileSize)
                    .setDepth(1); // Establecer una profundidad baja para la escalera
            }
        }
    }

    playNextSound() {
        const currentSound = this.sounds[this.currentSoundIndex];

        currentSound.play();
        currentSound.once('complete', () => {
            this.currentSoundIndex = (this.currentSoundIndex + 1) % this.sounds.length;
            this.playNextSound(); // Reproduce el siguiente sonido
        });
    }

    startMovement(dx, dy) {
        if (this.moving) return; // No permitir nuevos movimientos si ya está en movimiento

        this.moving = true; // Bloquear nuevos movimientos
        const targetX = this.player.x + dx;
        const targetY = this.player.y + dy;

        // Animar el movimiento hacia la celda objetivo
        this.tweens.add({
            targets: this.player,
            x: targetX,
            y: targetY,
            duration: 200, // Duración del movimiento
            ease: 'Quadratic.Out', // Efecto de easing para suavizar el movimiento
            onComplete: () => {
                const gridX = Math.floor(targetX / this.tileSize);
                const gridY = Math.floor(targetY / this.tileSize);

                // Verificar si la posición es válida y si hay un bloque en esa posición
                if (this.grid[gridX] && this.grid[gridX][gridY]) {
                    const block = this.grid[gridX][gridY];

                    // Recolectar carbón
                    if (block.type === 'carbon') {
                        this.carbonCount += 1; // Incrementar el contador de carbón
                        this.carbonText.setText(`Carbón: ${this.carbonCount}`); // Actualizar el menú
                        block.type = 'empty'; // Cambiar el tipo del bloque a vacío

                        // Destruir la textura de carbón (superposición) si existe
                        if (block.overlaySprite) {
                            block.overlaySprite.destroy();
                            block.overlaySprite = null;
                        }

                        // Destruir la textura base (piedra) si existe
                        if (block.baseSprite) {
                            block.baseSprite.destroy();
                            block.baseSprite = null;
                        }
                    }

                    // Recolectar cobre
                    if (block.type === 'cobre') {
                        this.cobreCount += 1; // Incrementar el contador de cobre
                        this.cobreText.setText(`Cobre: ${this.cobreCount}`); // Actualizar el menú
                        block.type = 'empty'; // Cambiar el tipo del bloque a vacío
                        if (block.sprite) block.sprite.destroy(); // Eliminar el sprite del bloque de cobre
                    }

                    // Recolectar hierro
                    if (block.type === 'hierro') {
                        this.hierroCount += 1; // Incrementar el contador de hierro
                        this.hierroText.setText(`Hierro: ${this.hierroCount}`); // Actualizar el menú
                        block.type = 'empty'; // Cambiar el tipo del bloque a vacío
                        if (block.sprite) block.sprite.destroy(); // Eliminar el sprite del bloque de hierro
                    }

                    // Recolectar plata
                    if (block.type === 'plata') {
                        this.plataCount += 1; // Incrementar el contador de plata
                        this.plataText.setText(`Plata: ${this.plataCount}`); // Actualizar el menú
                        block.type = 'empty'; // Cambiar el tipo del bloque a vacío
                        if (block.sprite) {
                            block.sprite.destroy(); // Eliminar el sprite del bloque de plata
                        }
                    }

                    // Recolectar oro
                    if (block.type === 'oro') {
                        this.oroCount = (this.oroCount || 0) + 1; // Incrementar el contador de oro
                        this.oroText.setText(`Oro: ${this.oroCount}`); // Actualizar el menú
                        block.type = 'empty'; // Cambiar el tipo del bloque a vacío
                        if (block.sprite) block.sprite.destroy(); // Eliminar el sprite del bloque de oro
                    }

                    if (block.type === 'rubi') { // Recolectar rubí
                        this.rubiCount = (this.rubiCount || 0) + 1; // Incrementar el contador de rubí
                        this.rubiText.setText(`Rubí: ${this.rubiCount}`); // Actualizar el texto en el menú
                        block.type = 'empty'; // Cambiar el tipo del bloque a vacío
                        if (block.sprite) block.sprite.destroy(); // Eliminar el sprite del bloque de rubí
                    }

                    // Recolectar esmeralda
                    if (block.type === 'esmeralda') {
                        this.esmeraldaCount += 1; // Incrementar el contador de esmeraldas
                        this.esmeraldaText.setText(`Esmeraldas: ${this.esmeraldaCount}`); // Actualizar el texto en el menú
                        block.type = 'empty'; // Vaciar el bloque
                        if (block.sprite) {
                            block.sprite.destroy(); // Eliminar el sprite
                            block.sprite = null; // Asegurarse de que no haya referencia
                        }
                    }

                    // Recolectar diamante
                    if (block.type === 'diamante') {
                        this.diamanteCount = (this.diamanteCount || 0) + 1; // Incrementar el contador de diamantes
                        this.diamanteText.setText(`Diamantes: ${this.diamanteCount}`); // Actualizar el texto en el menú
                        block.type = 'empty'; // Vaciar el bloque
                        if (block.sprite) {
                            block.sprite.destroy(); // Eliminar el sprite
                            block.sprite = null; // Asegurarse de que no haya referencia
                        }
                    }

                    // Vaciar bloques de tierra o piedra
                    if (block.type === 'tierra' || block.type === 'piedra') {
                        block.type = 'empty';
                        if (block.sprite) block.sprite.destroy();
                    }
                }

                // Liberar el bloqueo de movimiento
                this.moving = false;
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