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
        this.load.image('corazon', 'assets/corazon.png'); // Carga el icono del corazón
        this.load.image('tienda', 'assets/shop.png'); // Asegúrate de que el nombre del archivo sea correcto
        this.load.image('icono_carbon', 'assets/icono_carbon.png');
        this.load.image('icono_cobre', 'assets/icono_cobre.png');
        this.load.image('icono_hierro', 'assets/icono_hierro.png');
        this.load.image('icono_plata', 'assets/icono_plata.png');
        this.load.image('icono_oro', 'assets/icono_oro.png');
        this.load.image('icono_rubi', 'assets/icono_rubi.png');
        this.load.image('icono_esmeralda', 'assets/icono_esmeralda.png');
        this.load.image('icono_diamante', 'assets/icono_diamante.png');
        this.load.image('icono_moneda', 'assets/icono_moneda.png'); // Ruta del icono de monedaf
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

        // Definir las capas donde aparecen los minerales
        this.mineralSpawnLayers = {
            carbon: { min: 3, max: 100, count: 900 },   // 🟤 Carbón: desde la primera capa de piedra
            cobre: { min: 10, max: 80, count: 700 },    // 🟠 Cobre: más profundo que el carbón
            hierro: { min: 25, max: 120, count: 600 },  // 🔩 Hierro: aparece después del cobre
            plata: { min: 40, max: 150, count: 500 },   // 🥈 Plata: empieza más profundo que antes
            oro: { min: 60, max: 175, count: 350 },     // 🟡 Oro: solo en las capas bajas
            rubi: { min: 80, max: 175, count: 250 },    // ❤️ Rubí: sigue siendo raro y profundo
            esmeralda: { min: 100, max: 175, count: 180 },  // 💚 Esmeralda: aún más raro
            diamante: { min: 125, max: 175, count: 120 }   // 💎 Diamante: el más raro y profundo
        };

        // Generar Carbon (Desde la primera capa de piedra hasta la capa 80)
        let carbonCount = 900;
        while (carbonCount > 0) {
            const x = Phaser.Math.Between(0, gridSize - 1);
            const y = Phaser.Math.Between(3, 100);

            if (this.grid[x] && this.grid[x][y] && this.grid[x][y].type === 'piedra') {
                this.grid[x][y].type = 'carbon';
                carbonCount--;
            }
        }

        // Generar Cobre (Aparece un poco más profundo)
        let cobreCount = 700;
        while (cobreCount > 0) {
            const x = Phaser.Math.Between(0, gridSize - 1);
            const y = Phaser.Math.Between(10, 80); // 📌 Ahora empieza en 10 en vez de 15

            if (this.grid[x][y].type === 'piedra') {
                this.grid[x][y].type = 'cobre';
                cobreCount--;
            }
        }

        // Generar Hierro
        let hierroCount = 600;
        while (hierroCount > 0) {
            const x = Phaser.Math.Between(0, gridSize - 1);
            const y = Phaser.Math.Between(25, 120); // 📌 Antes 30, ahora 25 para no estar tan profundo

            if (this.grid[x][y].type === 'piedra') {
                this.grid[x][y].type = 'hierro';
                hierroCount--;
            }
        }

        // Generar Plata
        let plataCount = 500;
        while (plataCount > 0) {
            const x = Phaser.Math.Between(0, gridSize - 1);
            const y = Phaser.Math.Between(40, 150); // 📌 Antes 50, ahora 40 para no estar tan profundo

            if (this.grid[x][y].type === 'piedra') {
                this.grid[x][y].type = 'plata';
                plataCount--;
            }
        }

        // Generar Oro
        let oroCount = 350;
        while (oroCount > 0) {
            const x = Phaser.Math.Between(0, gridSize - 1);
            const y = Phaser.Math.Between(60, gridSize - 1);

            if (this.grid[x][y].type === 'piedra') {
                this.grid[x][y].type = 'oro';
                oroCount--;
            }
        }

        // Generar Rubí
        let rubiCount = 250;
        while (rubiCount > 0) {
            const x = Phaser.Math.Between(0, gridSize - 1);
            const y = Phaser.Math.Between(80, gridSize - 1);

            if (this.grid[x][y].type === 'piedra') {
                this.grid[x][y].type = 'rubi';
                rubiCount--;
            }
        }

        // Generar Esmeralda
        let esmeraldaCount = 180;
        while (esmeraldaCount > 0) {
            const x = Phaser.Math.Between(0, gridSize - 1);
            const y = Phaser.Math.Between(100, gridSize - 1);

            if (this.grid[x][y].type === 'piedra') {
                this.grid[x][y].type = 'esmeralda';
                esmeraldaCount--;
            }
        }

        // Generar Diamante
        let diamanteCount = 120;
        while (diamanteCount > 0) {
            const x = Phaser.Math.Between(0, gridSize - 1);
            const y = Phaser.Math.Between(125, gridSize - 1);

            if (this.grid[x][y].type === 'piedra') {
                this.grid[x][y].type = 'diamante';
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

        // Barra de vida - fondo gris
        this.healthBarBackground = this.add.graphics()
            .fillStyle(0x444444, 1)
            .fillRoundedRect(50, 40, 204, 16, 8) // 📌 Movida más a la derecha (X = 100)
            .setScrollFactor(0)
            .setDepth(10);

        this.healthBar = this.add.graphics()
            .fillStyle(0x00ff00, 1)
            .fillRoundedRect(52, 42, 200, 12, 6) // 📌 Movida más a la derecha (X = 102)
            .setScrollFactor(0)
            .setDepth(11);

        this.healthIcon = this.add.image(40, 48, 'corazon') // 📍 Ajustamos posición X e Y
            .setOrigin(0.5, 0.5) // 🔹 Centrar correctamente el icono
            .setScale(0.05) // 📏 Tamaño más pequeño y proporcional
            .setScrollFactor(0) // 📌 Evita que se mueva con la cámara
            .setDepth(12); // 🔼 Mantenerlo por encima de la barra de vida

        // Variable de salud inicial
        this.health = 100;

        this.cursors = this.input.keyboard.createCursorKeys();
        this.spaceKey = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.SPACE);

        // Crear el contenedor del menú de la tienda
        this.menuTiendaContainer = this.add.container(0, 0).setVisible(false).setDepth(20);

        // Crear fondo del menú de la tienda
        const borde = 38; // 1 cm en píxeles
        const menuAncho = this.cameras.main.width - 2 * borde;
        const menuAlto = this.cameras.main.height - 2 * borde;

        this.menuFondo = this.add.rectangle(0, 0, menuAncho, menuAlto, 0x000000, 0.8)
            .setOrigin(0.5)
            .setDepth(20)
            .setInteractive();

        this.menuTiendaContainer.add(this.menuFondo);

        // Centrar el menú en la pantalla
        this.menuTiendaContainer.setPosition(
            this.cameras.main.scrollX + this.cameras.main.width / 2,
            this.cameras.main.scrollY + this.cameras.main.height / 2
        );

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

        // Crear el fondo semitransparente detrás del texto de coordenadas
        this.coordinatesBackground = this.add.graphics();
        this.coordinatesBackground.fillStyle(0x000000, 0.5); // Color negro con 50% de transparencia
        const textWidth = 150; // Ajusta el ancho del fondo según el texto
        const textHeight = 40;
        this.coordinatesBackground.fillRoundedRect(
            (this.cameras.main.width / 2) - (textWidth / 2), // Centrar en X
            5, // Margen superior
            textWidth,
            textHeight,
            10
        );
        this.coordinatesBackground.setScrollFactor(0).setDepth(99); // Fijarlo en la pantalla y ponerlo detrás del texto

        this.coordinatesText = this.add.text(
            this.cameras.main.width / 2, // Centrado en X
            10, // Margen desde la parte superior
            'X: 0, Y: 0',
            {
                fontSize: '20px',
                fill: '#ffffff',
                fontFamily: 'Arial',
                fontStyle: 'bold'
            }
        ).setOrigin(0.5, 0).setScrollFactor(0).setDepth(100);

        const posicionXTienda = 7 * this.tileSize; // Convertir coordenada de la cuadrícula a píxeles
        const posicionYTienda = 3 * this.tileSize; // La tienda debe estar en la superficie

        this.tienda = this.add.image(posicionXTienda, posicionYTienda, 'tienda')
            .setOrigin(0, 1) // La base de la tienda toca el suelo
            .setDepth(4) // Asegurar que esté por encima de otros objetos
            .setDisplaySize(this.tileSize * 3, this.tileSize * 3); // Ajustar tamaño si es necesario
    }

    updateHealthBar() {
        // Borrar la barra actual para redibujarla
        this.healthBar.clear();

        // Elegir color según la cantidad de vida
        let color = 0x00ff00; // Verde (vida alta)
        if (this.health <= 60) color = 0xffff00; // Amarillo (vida media)
        if (this.health <= 30) color = 0xff0000; // Rojo (vida baja)

        // Dibujar la nueva barra con la vida actual
        this.healthBar.fillStyle(color, 1)
            .fillRoundedRect(22, 22, (this.health / 100) * 200, 12, 6); // Ancho proporcional a la vida
    }

    takeDamage(damage) {
        const newHealth = Math.max(0, this.health - damage); // Calcular la nueva vida

        // Animar la reducción de vida gradualmente
        this.tweens.add({
            targets: this,
            health: newHealth,
            duration: 500, // Tiempo de la animación (en ms)
            ease: 'Linear',
            onUpdate: () => {
                let color = 0x00ff00; // Verde
                if (this.health <= 60) color = 0xffff00; // Amarillo
                if (this.health <= 30) color = 0xff0000; // Rojo

                this.healthBar.clear()
                    .fillStyle(color, 1)
                    .fillRoundedRect(52, 42, (this.health / 100) * 200, 12, 6);
            },
            onComplete: () => {
                if (this.health <= 0) {
                    this.handleDeath();
                }
            }
        });
    }

    handleDeath() {
        console.log("💀 El personaje ha muerto.");

        // ❌ Evitar que siga moviéndose
        this.moving = true;
        this.input.keyboard.enabled = false;

        // 🩸 Mostrar una animación de pantalla roja como efecto de muerte
        const screenFlash = this.add.rectangle(0, 0, this.cameras.main.width, this.cameras.main.height, 0xff0000, 0.5)
            .setOrigin(0)
            .setScrollFactor(0)
            .setDepth(50);

        this.tweens.add({
            targets: screenFlash,
            alpha: 0,
            duration: 1500,
            ease: 'Power2',
            onComplete: () => screenFlash.destroy()
        });

        // 🕒 Reiniciar después de 3 segundos
        this.time.delayedCall(1000, () => {
            console.log("🔄 Reiniciando...");
            this.resetGame();
        }, [], this);
    }

    resetGame() {
        this.health = 100;
        this.healthBar.clear()
            .fillStyle(0x00ff00, 1)
            .fillRoundedRect(22, 42, 200, 12, 6);

        this.player.setPosition(2 * this.tileSize, 2 * this.tileSize); // Reiniciar posición del jugador
        this.input.keyboard.enabled = true; // Reactivar controles
        this.moving = false; // Permitir movimiento de nuevo
    }

    abrirMenuTienda() {
        if (this.menuTiendaContainer.visible) return; // Si ya está abierto, no hacer nada

        console.log("🟢 Abriendo menú de la tienda...");

        const borde = 38; // 1 cm en píxeles
        const menuAncho = this.cameras.main.width - 2 * borde;
        const menuAlto = this.cameras.main.height - 2 * borde;

        // Crear el borde marrón
        if (!this.menuBorde) {
            this.menuBorde = this.add.rectangle(0, 0, menuAncho, menuAlto, 0xFFF0C9, 1) // Marrón oscuro
                .setOrigin(0.5)
                .setDepth(20);
            this.menuTiendaContainer.add(this.menuBorde);
        } else {
            this.menuBorde.setSize(menuAncho, menuAlto);
        }

        // Agregar el título "Tienda"
        if (!this.menuTitulo) {
            this.menuTitulo = this.add.text(0, -menuAlto / 2 + 40, "Tienda", {
                fontSize: "48px",
                fill: "#000000", // Negro
                fontStyle: "bold",
                fontFamily: "Arial"
            })
                .setOrigin(0.5)
                .setDepth(22);
            this.menuTiendaContainer.add(this.menuTitulo);
        }

        // Agregar el subtítulo "VENDER" debajo de "Tienda"
        if (!this.menuSubtitulo) {
            this.menuSubtitulo = this.add.text(0, -menuAlto / 2 + 90, "VENDER", {
                fontSize: "32px",
                fill: "#444444", // Gris oscuro
                fontStyle: "bold",
                fontFamily: "Arial"
            })
                .setOrigin(0.5)
                .setDepth(22);
            this.menuTiendaContainer.add(this.menuSubtitulo);
        }

        // Centrar el menú respecto a la cámara y el mundo
        this.menuTiendaContainer.setPosition(
            this.cameras.main.scrollX + this.cameras.main.width / 2,
            this.cameras.main.scrollY + this.cameras.main.height / 2
        );

        // Detener el personaje completamente al abrir la tienda
        this.player.setVelocity(0, 0); // Para por completo cualquier movimiento
        this.moving = false; // Reiniciar el estado de movimiento

        // Desactivar las teclas de movimiento, pero mantener la barra espaciadora
        this.cursors.left.enabled = false;
        this.cursors.right.enabled = false;
        this.cursors.up.enabled = false;
        this.cursors.down.enabled = false;

        // Definir los minerales con sus imágenes y valores
        const minerales = [
            { nombre: "carbon", valor: 1 },
            { nombre: "cobre", valor: 2 },
            { nombre: "hierro", valor: 5 },
            { nombre: "plata", valor: 10 },
            { nombre: "oro", valor: 25 },
            { nombre: "rubi", valor: 35 },
            { nombre: "esmeralda", valor: 50 },
            { nombre: "diamante", valor: 75 }
        ];

        // Crear contenedor para los botones
        if (!this.menuVenta) {
            this.menuVenta = this.add.container(0, 0).setDepth(22).setVisible(true);
            this.menuTiendaContainer.add(this.menuVenta);

            const columnas = 4;  // 4 columnas
            const filas = 2;     // 2 filas
            const espacioX = menuAncho / columnas; // Espacio horizontal
            const espacioY = menuAlto / filas;   // Espacio vertical

            for (let i = 0; i < minerales.length; i++) {
                const columna = i % columnas;
                const fila = Math.floor(i / columnas);

                const xPos = -menuAncho / 2 + espacioX * columna + espacioX / 2;
                const yPos = -menuAlto / 2 + espacioY * fila + espacioY / 2;

                // Crear botón con el icono del mineral
                const boton = this.add.image(xPos, yPos, `icono_${minerales[i].nombre}`)
                    .setOrigin(0.5)
                    .setDisplaySize(espacioX * 0.75, espacioY * 0.75) // Ajusta al tamaño de la cuadrícula
                    .setInteractive({ useHandCursor: true });

                // Evento de clic para vender el mineral
                boton.on('pointerdown', () => {
                    console.log(`🟢 Vendiendo ${minerales[i].nombre}`);
                    this.venderMineral(minerales[i].nombre);
                });

                // Texto con el valor de la moneda (sin "Valor:")
                const textoNumero = this.add.text(xPos - 2, yPos + 110, `${minerales[i].valor}`, {
                    fontSize: "24px",
                    fill: "#000000",
                    fontStyle: "bold",
                    fontFamily: "Arial"
                }).setOrigin(1, 0.5).setDepth(23);

                // Icono de moneda después del número
                const monedaIcono = this.add.image(xPos + 2, yPos + 110, "icono_moneda") // Usar la moneda que generamos antes
                    .setOrigin(0, 0.5)
                    .setDisplaySize(35, 35) // Ajustar tamaño del icono de moneda
                    .setDepth(23);

                this.menuVenta.add(boton);
                this.menuVenta.add(textoNumero);
                this.menuVenta.add(monedaIcono);
            }
        }

        this.menuTiendaContainer.setVisible(true);
        this.physics.world.pause(); // Pausar el mundo físico
        this.cameras.main.stopFollow(); // Detener el seguimiento de la cámara
    }

    // 🔴 Al cerrar el menú, permitir nuevamente el movimiento
    cerrarMenuTienda() {
        if (!this.menuTiendaContainer.visible) return; // Si ya está cerrado, no hacer nada

        console.log("🔴 Cerrando menú de la tienda...");

        this.menuTiendaContainer.setVisible(false); // Ocultar el menú de la tienda
        this.physics.world.resume(); // Reanudar el mundo físico
        this.cameras.main.startFollow(this.player); // Volver a seguir al jugador

        // Asegurar que el personaje no tenga movimiento residual
        this.player.setVelocity(0, 0);
        this.moving = false;

        // Reactivar movimiento del personaje
        this.cursors.left.enabled = true;
        this.cursors.right.enabled = true;
        this.cursors.up.enabled = true;
        this.cursors.down.enabled = true;
    }

    // Función para vender un mineral
    venderMineral(tipo) {
        if (this[tipo + "Count"] > 0) { // Asegurar que el jugador tiene minerales
            this[tipo + "Count"]--; // Restar 1
            console.log(`💰 Vendido: ${tipo}. Ahora tienes ${this[tipo + "Count"]}`);
        } else {
            console.log(`❌ No tienes suficiente ${tipo} para vender.`);
        }
    }

    update() {
        // Si el menú de la tienda está abierto, detener el personaje pero permitir cerrar el menú
        if (this.menuTiendaContainer.visible) {
            this.player.setVelocity(0, 0);
            this.moving = false;

            // Permitir cerrar la tienda con la barra espaciadora
            if (Phaser.Input.Keyboard.JustDown(this.spaceKey)) {
                this.cerrarMenuTienda();
            }

            return; // Evitar que se ejecute cualquier otro código de movimiento
        }

        // Si el personaje ya está en movimiento, no hacer nada más
        if (this.moving) return;

        const tileSize = this.tileSize; // Tamaño de un bloque (128 en este caso)

        // Obtener la posición del personaje en la cuadrícula
        const gridX = Math.floor(this.player.x / tileSize); // Posición en la cuadrícula X
        const gridY = Math.floor(this.player.y / tileSize); // Posición en la cuadrícula Y
        const belowGridY = gridY + 1; // Celda justo debajo del personaje

        // Verificar que el personaje no esté ya cayendo y que no esté sobre una escalera
        if (!this.moving && belowGridY < this.grid[0].length && this.grid[gridX] && this.grid[gridX][belowGridY]) {
            let fallDistance = 0; // Contador para la altura de la caída
            let checkY = belowGridY; // Empezamos desde el bloque debajo del personaje

            // Contar cuántos bloques vacíos hay debajo hasta encontrar un suelo o escalera
            while (checkY < this.grid[0].length && this.grid[gridX][checkY].type === 'empty') {
                fallDistance++; // Aumentamos la distancia de caída
                checkY++; // Revisamos el siguiente bloque hacia abajo
            }

            //Evitar caída si el personaje está en una escalera**
            if (this.grid[gridX][gridY].type === 'ladder') {
                fallDistance = 0; // Anulamos la caída si está en una escalera
            }

            // Si hay al menos un bloque vacío, iniciamos la caída con velocidad proporcional
            if (fallDistance > 0) {
                let fallSpeed = Math.max(100, 50 * fallDistance); // Aumenta la velocidad en función de la altura
                this.startFall(fallDistance, fallSpeed);
                return; // Salir del update para evitar otros movimientos
            }
        }


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
        // Obtener la posición actual del personaje en la cuadrícula
        const playerGridX = Math.floor(this.player.x / this.tileSize);
        const playerGridY = Math.floor(this.player.y / this.tileSize);

        if (Phaser.Input.Keyboard.JustDown(this.spaceKey)) {
            console.log("🔹 Barra espaciadora detectada.");

            if (this.menuTiendaContainer.visible) {
                console.log("🔴 Cerrando menú de la tienda...");
                this.cerrarMenuTienda();
            } else if (playerGridX === 8 && playerGridY === 2) {
                console.log("🟢 Abriendo menú de la tienda...");
                this.abrirMenuTienda();
            }
        }

        // Lógica para colocar escaleras manteniendo la barra espaciadora
        if (this.spaceKey.isDown) {
            if (gridY >= 3 && this.grid[gridX] && this.grid[gridX][gridY] && this.grid[gridX][gridY].type === 'empty') {
                // Colocar una escalera
                this.grid[gridX][gridY].type = 'ladder'; // Cambiar el tipo del bloque
                this.grid[gridX][gridY].sprite = this.add.image(gridX * tileSize, gridY * tileSize, 'ladder')
                    .setOrigin(0)
                    .setDisplaySize(tileSize, tileSize)
                    .setDepth(1); // Establecer una profundidad baja para la escalera
            }
        }

        // Actualizar las coordenadas del jugador en el cartel
        this.coordinatesText.setText(`X: ${Math.floor(this.player.x / this.tileSize)}, Y: ${Math.floor(this.player.y / this.tileSize)}`);
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

    startFall(fallDistance) {
        this.moving = true; // Bloquear movimientos manuales mientras cae
        let currentFall = 0;
        let fallSpeed = 200;

        const fallStep = () => {
            if (currentFall < fallDistance) {
                currentFall++;
                fallSpeed = Math.max(50, fallSpeed * 0.85);

                this.tweens.add({
                    targets: this.player,
                    y: this.player.y + this.tileSize,
                    duration: fallSpeed,
                    ease: 'Linear',
                    onComplete: () => {
                        if (currentFall < fallDistance) {
                            fallStep();
                        } else {
                            // **Aplicar daño después de la caída**
                            if (fallDistance > 3) {
                                let damage = (fallDistance - 3) * 10;
                                this.takeDamage(damage);
                            }
                            this.moving = false;
                        }
                    }
                });
            }
        };

        fallStep();
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
