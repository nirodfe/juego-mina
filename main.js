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
        this.currentTween = null;     // Guardará el tween en curso
        this.isLadderMovement = false; // Indicará si el movimiento actual es con escalera
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
        this.load.image('refineria', 'assets/shop.png'); // Asegúrate de que el nombre del archivo sea correcto
        this.load.image('icono_carbon', 'assets/icono_carbon.png');
        this.load.image('icono_cobre', 'assets/icono_cobre.png');
        this.load.image('icono_hierro', 'assets/icono_hierro.png');
        this.load.image('icono_plata', 'assets/icono_plata.png');
        this.load.image('icono_oro', 'assets/icono_oro.png');
        this.load.image('icono_rubi', 'assets/icono_rubi.png');
        this.load.image('icono_esmeralda', 'assets/icono_esmeralda.png');
        this.load.image('icono_diamante', 'assets/icono_diamante.png');
        this.load.image('icono_moneda', 'assets/icono_moneda.png'); // Ruta del icono de moneda
        this.load.image('arsenal', 'assets/arsenal.png');
        this.load.image('pico_madera', 'assets/pico_madera.png');
        this.load.image('pico_piedra', 'assets/pico_piedra.png');
        this.load.image('pico_hierro', 'assets/pico_hierro.png');
        this.load.image('pico_oro', 'assets/pico_oro.png');
        this.load.image('bloque_hierro', 'assets/bloque_hierro.png');
    }

    create() {
        this.cursors = this.input.keyboard.createCursorKeys();
        this.spaceKey = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.SPACE);

        const tileSize = 128;
        const gridSize = 175;

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
        const maxSpeed = 7; // Velocidad máxima en píxeles/segundo

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
        this.player = this.physics.add.sprite(8 * this.tileSize, 2 * this.tileSize, 'personaje')
            .setOrigin(0)
            .setDepth(5); // Profundidad correcta para estar debajo del menú pero sobre otros elementos
        this.player.displayWidth = this.tileSize; // Ajustar ancho al tamaño de la cuadrícula
        this.player.displayHeight = this.tileSize; // Ajustar alto al tamaño de la cuadrícula
        this.player.setCollideWorldBounds(true);
        this.physics.add.collider(this.player, this.bloquesHierro);

        const spawnX = Math.floor(this.player.x / this.tileSize);
        const spawnY = Math.floor(this.player.y / this.tileSize) + 1; // Justo debajo del jugador

        this.grid[spawnX][spawnY] = {
            type: 'iron', sprite: this.add.image(spawnX * this.tileSize, spawnY * this.tileSize, 'bloque_hierro')
                .setOrigin(0)
                .setDisplaySize(this.tileSize, this.tileSize)
                .setDepth(1) // Mantenerlo detrás del jugador
        };

        this.cameras.main.startFollow(this.player, true, 1, 1);

        // Variable de salud inicial
        this.health = 100;

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

        this.cantidadEscaleras = 100; // El jugador comienza con 50 escaleras

        // Crear icono de escalera debajo del icono de vida (healthIcon)
        this.iconoEscaleraHUD = this.add.image(this.healthIcon.x, this.healthIcon.y + 50, "ladder")
            .setOrigin(0.5)
            .setDisplaySize(64, 64) // Ajusta el tamaño del icono
            .setScrollFactor(0) // Fijarlo a la UI
            .setDepth(12); // Mantenerlo visible sobre otros elementos

        // Crear el contador de escaleras debajo del icono
        this.contadorEscaleras = this.add.text(this.iconoEscaleraHUD.x + 25, this.iconoEscaleraHUD.y + 35, this.cantidadEscaleras, {
            fontSize: "24px",
            fill: "#FFFF00",
            fontStyle: "bold",
            fontFamily: "Arial"
        })
            .setOrigin(0.5)
            .setScrollFactor(0)
            .setDepth(12);

        // Inicializar el pico del jugador como "pico_madera"
        this.picoActual = "pico_madera";

        // Crear el icono del pico en la UI
        this.iconoPico = this.add.image(this.healthIcon.x + 100, this.healthIcon.y + 50, this.picoActual)
            .setOrigin(0.5)
            .setDisplaySize(64, 64)
            .setScrollFactor(0)
            .setDepth(12);

        // Durabilidad de cada tipo de pico
        this.durabilidadesPicos = {
            pico_madera: 100,
            pico_piedra: 200,
            pico_hierro: 300,
            pico_oro: 500
        };

        // Definir qué materiales puede minar cada pico
        this.materialesPermitidos = {
            pico_madera: ['tierra', 'piedra', 'carbon'],
            pico_piedra: ['tierra', 'piedra', 'carbon', 'cobre', 'hierro'],
            pico_hierro: ['tierra', 'piedra', 'carbon', 'cobre', 'hierro', 'plata', 'oro'],
            pico_oro: ['tierra', 'piedra', 'carbon', 'cobre', 'hierro', 'plata', 'oro', 'rubi', 'esmeralda', 'diamante']
        };

        // Inicializar el pico del jugador con madera
        this.picoActual = "pico_madera";
        this.durabilidadPico = this.durabilidadesPicos[this.picoActual]; // Durabilidad inicial

        // Crear el fondo de la barra de durabilidad
        this.barraDurabilidadFondo = this.add.rectangle(
            this.iconoPico.x, this.iconoPico.y + 40, 70, 10, 0x555555
        ).setOrigin(0.5).setScrollFactor(0).setDepth(11);

        // Crear la barra de durabilidad del pico
        this.barraDurabilidad = this.add.rectangle(
            this.iconoPico.x - 35, this.iconoPico.y + 40, 70, 10, 0x00ff00
        ).setOrigin(0, 0.5).setScrollFactor(0).setDepth(12);

        // Inicializar monedas
        this.monedas = 0;

        this.monedaTexto = this.add.text(this.cameras.main.width - 100, 62, this.monedas.toString(), {
            fontSize: "32px",
            fill: "#000000",
            fontStyle: "bold",
            fontFamily: "Arial"
        })
            .setOrigin(1, 0.5)
            .setDepth(100)
            .setScrollFactor(0)
            .setVisible(false); // Ocultarlo hasta que se necesite

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

        // Añade este texto de rubí al contenedor del menú
        this.menuContainer.add(this.rubiText);

        // Añadir el textode oro al contenedor del menú
        this.menuContainer.add(this.oroText);

        // Añadir el texto de plata al contenedor del menú
        this.menuContainer.add(this.plataText);

        // Añadir el texto de hierro al contenedor del menú
        this.menuContainer.add(this.hierroText);

        // Añadir el texto de cobre al contenedor del menú
        this.menuContainer.add(this.cobreText);

        // Añadir el texto de carbón al contenedor del menú
        this.menuContainer.add(this.carbonText);

        // Guardar referencias a los textos en un objeto para acceder a ellos fácilmente
        this.mineralTextos = {
            carbon: this.carbonText,
            cobre: this.cobreText,
            hierro: this.hierroText,
            plata: this.plataText,
            oro: this.oroText,
            rubi: this.rubiText,
            esmeralda: this.esmeraldaText,
            diamante: this.diamanteText
        };

        // Tamaño deseado del botón
        const buttonSize = 100;

        // Crear el botón de la mochila
        const mochilaButton = this.add.image(
            this.cameras.main.width - buttonSize / 2 - 16, // Posición en X
            buttonSize / 2 + 16, // Posición en Y
            'mochila' // Imagen del botón
        )
            .setOrigin(0.5)
            .setInteractive({ useHandCursor: true })
            .setDisplaySize(buttonSize, buttonSize)
            .setScrollFactor(0)
            .setDepth(15);

        // Evento de clic en el botón de la mochila
        mochilaButton.on('pointerdown', () => {
            // Si el menú de la refineria o arsenal está abierto, ignoramos el clic
            if (this.menuRefineriaContainer.visible || this.menuArsenalContainer.visible) {
                return;
            }

            // Si el menú de la mochila ya está abierto, cerrarlo
            if (this.menuContainer.visible) {
                this.menuContainer.setVisible(false);
                this.physics.world.resume();
                this.input.keyboard.enabled = true;
                this.cameras.main.startFollow(this.player);
                this.input.keyboard.resetKeys();
                this.player.setVelocity(0, 0);
                this.moving = false;
            } else {
                // Abrir el menú de la mochila
                this.player.setVelocity(0, 0);
                this.moving = false;
                this.menuContainer.setPosition(
                    this.cameras.main.scrollX + this.cameras.main.width / 2,
                    this.cameras.main.scrollY + this.cameras.main.height / 2
                );
                menuBackground.setSize(this.cameras.main.width, this.cameras.main.height);
                this.menuContainer.setVisible(true);
                this.physics.world.pause();
                this.input.keyboard.enabled = false;
                this.cameras.main.stopFollow();
                this.input.keyboard.resetKeys();
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

        // Colocar la "Refineria" en la celda (3,3)
        const posicionXRefineria = 3 * this.tileSize; // Convertir coordenada de la cuadrícula a píxeles
        const posicionYRefineria = 3 * this.tileSize; // La refineria debe estar en la superficie

        this.refineria = this.add.image(posicionXRefineria, posicionYRefineria, 'refineria')
            .setOrigin(0, 1) // La base de la refineria toca el suelo
            .setDepth(4) // Asegurar que esté por encima de otros objetos
            .setDisplaySize(this.tileSize * 3, this.tileSize * 3); // Ajustar tamaño si es necesario

        // Colocar el "Arsenal Minero" en la celda (11,3)
        const posicionXArsenal = 11 * this.tileSize;  // Columna 15
        const posicionYArsenal = 3 * this.tileSize;    // Fila 2

        this.arsenal = this.add.image(posicionXArsenal, posicionYArsenal, 'arsenal')
            .setOrigin(0, 1) // La base de la imagen se alinea con el borde inferior de la celda
            .setDepth(4)
            .setDisplaySize(this.tileSize * 3, this.tileSize * 3); // Ajusta el tamaño según necesites

        // Crear el contenedor del menú de la refineria
        this.menuRefineriaContainer = this.add.container(0, 0).setVisible(false).setDepth(20);

        // Crear el contenedor del menú del arsenal
        this.menuArsenalContainer = this.add.container(0, 0).setVisible(false).setDepth(20);

        // Crear un grupo de colisión para los bloques de hierro
        this.bloquesHierro = this.physics.add.staticGroup();

        const tiendas = [
            { x: [3, 4, 5], y: 2 }, // Tienda de vender (bloques en X=3, 4 y 5)
            { x: [11, 12, 13], y: 2 } // Tienda de comprar (bloques en X=11, 12 y 13)
        ];

        tiendas.forEach(tienda => {
            tienda.x.forEach(tiendaX => { // Iterar sobre cada X en la tienda
                const tiendaY = tienda.y + 1; // Justo debajo de la tienda

                // Crear bloque de hierro con cuerpo estático para colisiones
                const bloque = this.bloquesHierro.create(tiendaX * this.tileSize, tiendaY * this.tileSize, 'bloque_hierro')
                    .setOrigin(0)
                    .setDisplaySize(this.tileSize, this.tileSize)
                    .refreshBody(); // Refrescar el cuerpo de colisión

                // Guardar el bloque en la grid para evitar que sea minado
                this.grid[tiendaX][tiendaY] = { type: 'iron', sprite: bloque };
            });
        });

        // Inicializar el contador de monedas
        this.monedaCount = 0;

        // Crear el icono de moneda en la esquina superior derecha
        this.monedaIcono = this.add.image(this.cameras.main.width - 50, 60, "icono_moneda")
            .setOrigin(1, 0.5)
            .setDisplaySize(35, 35) // Ajustar tamaño del icono
            .setScrollFactor(0) // Fijarlo a la pantalla
            .setDepth(100)
            .setVisible(false); // Inicialmente oculto

        // Crear el texto de monedas al lado del icono
        this.monedaTexto = this.add.text(this.cameras.main.width - 100, 62, "0", {
            fontSize: "32px",
            fill: "#000000",
            fontStyle: "bold",
            fontFamily: "Arial"
        })
            .setOrigin(1, 0.5)
            .setDepth(100)
            .setScrollFactor(0)
            .setVisible(false); // Inicialmente oculto
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

        this.player.setPosition(8 * this.tileSize, 2 * this.tileSize); // Reiniciar posición del jugador
        this.input.keyboard.enabled = true; // Reactivar controles
        this.moving = false; // Permitir movimiento de nuevo
    }

    abrirMenuRefineria() {
        if (this.menuRefineriaContainer.visible) return; // Si ya está abierto, no hacer nada

        console.log("🟢 Abriendo menú de la refineria...");

        // Mostrar el contador de monedas al abrir la refineria
        this.monedaIcono.setVisible(true);
        this.monedaTexto.setVisible(true);

        const borde = 38; // 1 cm en píxeles
        const menuAncho = this.cameras.main.width - 2 * borde;
        const menuAlto = this.cameras.main.height - 2 * borde;

        // Crear el borde marrón
        if (!this.menuBorde) {
            this.menuBorde = this.add.rectangle(0, 0, menuAncho, menuAlto, 0xFFF0C9, 1) // Marrón oscuro
                .setOrigin(0.5)
                .setDepth(20);
            this.menuRefineriaContainer.add(this.menuBorde);
        } else {
            this.menuBorde.setSize(menuAncho, menuAlto);
        }

        // Agregar el título "Refinería del minero"
        if (!this.menuTitulo) {
            this.menuTitulo = this.add.text(0, -menuAlto / 2 + 40, "Refinería del minero", {
                fontSize: "48px",
                fill: "#000000", // Negro
                fontStyle: "bold",
                fontFamily: "Arial"
            })
                .setOrigin(0.5)
                .setDepth(22);
            this.menuRefineriaContainer.add(this.menuTitulo);
        }

        // Centrar el menú respecto a la cámara y el mundo
        this.menuRefineriaContainer.setPosition(
            this.cameras.main.scrollX + this.cameras.main.width / 2,
            this.cameras.main.scrollY + this.cameras.main.height / 2
        );

        // Detener el personaje completamente al abrir la refineria
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
            this.menuRefineriaContainer.add(this.menuVenta);

            const columnas = 4;  // 4 columnas
            const filas = 2;     // 2 filas
            const espacioX = menuAncho / columnas; // Espacio horizontal
            const espacioY = menuAlto / filas;   // Espacio vertical

            for (let i = 0; i < minerales.length; i++) {
                const columna = i % columnas;
                const fila = Math.floor(i / columnas);

                const xPos = -menuAncho / 2 + espacioX * columna + espacioX / 2;
                const yPos = -menuAlto / 2.2 + espacioY * fila + espacioY / 2;

                // Crear botón con el icono del mineral
                const boton = this.add.image(xPos, yPos, `icono_${minerales[i].nombre}`)
                    .setOrigin(0.5)
                    .setDisplaySize(espacioX * 0.55, espacioY * 0.55) // Ajusta al tamaño de la cuadrícula
                    .setInteractive({ useHandCursor: true });

                // Evento de clic para vender el mineral
                boton.on('pointerdown', () => {
                    console.log(`🟢 Vendiendo ${minerales[i].nombre}`);
                    this.venderMineral(minerales[i].nombre);
                });

                // Texto con el valor de la moneda (sin "Valor:")
                const textoNumero = this.add.text(xPos - 2, yPos + 92, `${minerales[i].valor}`, {
                    fontSize: "24px",
                    fill: "#000000",
                    fontStyle: "bold",
                    fontFamily: "Arial"
                }).setOrigin(1, 0.5).setDepth(23);

                // Icono de moneda después del número
                const monedaIcono = this.add.image(xPos + 2, yPos + 90, "icono_moneda") // Usar la moneda que generamos antes
                    .setOrigin(0, 0.5)
                    .setDisplaySize(35, 35) // Ajustar tamaño del icono de moneda
                    .setDepth(23);

                this.menuVenta.add(boton);
                this.menuVenta.add(textoNumero);
                this.menuVenta.add(monedaIcono);
            }
        }

        this.menuRefineriaContainer.setVisible(true);
        this.physics.world.pause(); // Pausar el mundo físico
        this.cameras.main.stopFollow(); // Detener el seguimiento de la cámara
    }

    // 🔴 Al cerrar el menú, permitir nuevamente el movimiento
    cerrarMenuRefineria() {
        if (!this.menuRefineriaContainer.visible) return; // Si ya está cerrado, no hacer nada

        console.log("🔴 Cerrando menú de la refineria...");

        // Ocultar el contador de monedas al cerrar la refineria
        this.monedaIcono.setVisible(false);
        this.monedaTexto.setVisible(false);

        this.menuRefineriaContainer.setVisible(false); // Ocultar el menú de la refineria
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

    cerrarMenuArsenal() {
        if (!this.menuArsenalContainer.visible) return; // Si ya está cerrado, no hacer nada

        console.log("🔴 Cerrando menú del arsenal...");

        // Ocultar el contador de monedas al cerrar la refineria
        this.monedaIcono.setVisible(false);
        this.monedaTexto.setVisible(false);

        this.menuArsenalContainer.setVisible(false); // Ocultar el menú de la refineria
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

    abrirMenuArsenal() {
        if (this.menuArsenalContainer.visible) return; // Si ya está abierto, no hacer nada

        console.log("🟢 Abriendo menú de Arsenal Minero...");

        // Mostrar el contador de monedas al abrir el menú
        this.monedaIcono.setVisible(true);
        this.monedaTexto.setVisible(true);

        const borde = 38; // 1 cm en píxeles
        const menuAncho = this.cameras.main.width - 2 * borde;
        const menuAlto = this.cameras.main.height - 2 * borde;

        // Crear el borde (marrón) para el menú de Arsenal
        if (!this.menuArsenalBorde) {
            this.menuArsenalBorde = this.add.rectangle(0, 0, menuAncho, menuAlto, 0xFFF0C9, 1) // Marrón oscuro
                .setOrigin(0.5)
                .setDepth(20);
            this.menuArsenalContainer.add(this.menuArsenalBorde);
        } else {
            this.menuArsenalBorde.setSize(menuAncho, menuAlto);
        }

        // Agregar el título "Arsenal Minero"
        if (!this.menuTituloArsenal) {
            this.menuTituloArsenal = this.add.text(0, -menuAlto / 2 + 40, "Arsenal Minero", {
                fontSize: "48px",
                fill: "#000000", // Negro
                fontStyle: "bold",
                fontFamily: "Arial"
            })
                .setOrigin(0.5)
                .setDepth(22);
            this.menuArsenalContainer.add(this.menuTituloArsenal);
        }

        // Centrar el menú respecto a la cámara y el mundo
        this.menuArsenalContainer.setPosition(
            this.cameras.main.scrollX + this.cameras.main.width / 2,
            this.cameras.main.scrollY + this.cameras.main.height / 2
        );

        // Detener el personaje completamente al abrir el menú
        this.player.setVelocity(0, 0); // Para detener cualquier movimiento
        this.moving = false; // Reiniciar el estado de movimiento

        // Desactivar las teclas de movimiento, pero mantener la barra espaciadora
        this.cursors.left.enabled = false;
        this.cursors.right.enabled = false;
        this.cursors.up.enabled = false;
        this.cursors.down.enabled = false;

        // Definir las herramientas con sus imágenes y valores
        const herramientas = [
            { nombre: "escalera", imagen: "ladder", valor: 2 },
            { nombre: "pico_madera", imagen: "pico_madera", valor: 5 },
            { nombre: "pico_piedra", imagen: "pico_piedra", valor: 10 },
            { nombre: "pico_hierro", imagen: "pico_hierro", valor: 25 },
            { nombre: "pico_oro", imagen: "pico_oro", valor: 50 }
        ];

        // Crear contenedor para los botones de compra
        if (!this.menuCompra) {
            this.menuCompra = this.add.container(0, 0).setDepth(22).setVisible(true);
            this.menuArsenalContainer.add(this.menuCompra);

            const columnas = 5;  // 5 columnas
            const filas = 1;     // 1 fila
            const espacioX = menuAncho / columnas; // Espacio horizontal
            const espacioY = menuAlto / filas;   // Espacio vertical

            for (let i = 0; i < herramientas.length; i++) {
                const columna = i % columnas;
                const fila = Math.floor(i / columnas);

                const xPos = -menuAncho / 2 + espacioX * columna + espacioX / 2;
                const yPos = -menuAlto / 2.2 + espacioY * fila + espacioY / 2;

                // Crear botón con el icono del ítem
                const boton = this.add.image(xPos, yPos, herramientas[i].imagen)
                    .setOrigin(0.5)
                    .setDisplaySize(espacioX * 0.55, espacioY / 2 * 0.55) // Ajusta al tamaño de la cuadrícula
                    .setInteractive({ useHandCursor: true })
                    .on('pointerdown', () => {
                        this.comprarItem(herramientas[i].nombre, herramientas[i].valor);
                    });

                // Texto con el precio del ítem
                const textoNumero = this.add.text(xPos - 2, yPos + 92 + 25, `${herramientas[i].valor}`, {
                    fontSize: "24px",
                    fill: "#000000",
                    fontStyle: "bold",
                    fontFamily: "Arial"
                }).setOrigin(1, 0.5).setDepth(23);

                // Icono de moneda después del número
                const monedaIcono = this.add.image(xPos + 2, yPos + 90 + 25, "icono_moneda")
                    .setOrigin(0, 0.5)
                    .setDisplaySize(35, 35) // Ajustar tamaño del icono de moneda
                    .setDepth(23);

                this.menuCompra.add(boton);
                this.menuCompra.add(textoNumero);
                this.menuCompra.add(monedaIcono);
            }
        }

        this.menuArsenalContainer.setVisible(true);
        this.physics.world.pause(); // Pausar el mundo físico
        this.cameras.main.stopFollow(); // Detener el seguimiento de la cámara
    }

    // Función para vender un mineral
    venderMineral(tipo) {
        if (this[tipo + "Count"] > 0) { // Verificar que el jugador tiene minerales
            this[tipo + "Count"]--; // Restar 1 unidad del mineral
            this.monedas = (this.monedas || 0) + this.obtenerValorMineral(tipo); // Sumar el valor al contador de monedas

            // Asegurar que el contador de monedas sigue visible y actualizado
            if (this.monedaTexto && this.monedaIcono) {
                this.monedaTexto.setText(this.monedas.toString()); // Convertir a string para evitar NaN
                this.monedaTexto.setVisible(true);
                this.monedaIcono.setVisible(true);
            }

            // 📌 **Actualizar el texto en la mochila incluso cuando llega a 0**
            if (this.mineralTextos[tipo]) {
                this.mineralTextos[tipo].setText(`${tipo.charAt(0).toUpperCase() + tipo.slice(1)}: ${this[tipo + "Count"]}`);
            }

            console.log(`💰 Vendido: ${tipo}. Ahora tienes ${this[tipo + "Count"]} y ${this.monedas} monedas.`);
        } else {
            console.log(`❌ No tienes suficiente ${tipo} para vender.`);
        }
    }

    // Función auxiliar para obtener el valor de cada mineral
    obtenerValorMineral(tipo) {
        const valores = {
            carbon: 1,
            cobre: 2,
            hierro: 5,
            plata: 10,
            oro: 25,
            rubi: 35,
            esmeralda: 50,
            diamante: 75
        };
        return valores[tipo] || 0; // Retorna 0 si el mineral no está en la lista
    }

    comprarItem(nombre, valor) {
        if (this.monedas >= valor) {
            this.monedas -= valor; // Restar monedas

            if (nombre === "escalera") {
                this.cantidadEscaleras++;
                this.contadorEscaleras.setText(this.cantidadEscaleras);
            } else if (nombre.includes("pico")) {
                // Si se compra un pico, actualizar el icono en la UI
                this.picoActual = nombre;
                this.iconoPico.setTexture(this.picoActual);
            }

            console.log(`🟢 Compraste ${nombre}. Te quedan ${this.monedas} monedas.`);

            if (this.monedaTexto) {
                this.monedaTexto.setText(this.monedas.toString());
            }
        } else {
            console.log(`❌ No tienes suficientes monedas para comprar ${nombre}.`);
        }
        if (nombre.includes("pico")) {
            this.picoActual = nombre;
            this.iconoPico.setTexture(this.picoActual);

            if (nombre.includes("pico")) {
                this.picoActual = nombre;
                this.iconoPico.setTexture(this.picoActual);

                // Restaurar la durabilidad del pico según su tipo
                this.durabilidadPico = this.durabilidadesPicos[this.picoActual];
                this.barraDurabilidad.setScale(1, 1); // Rellenar la barra
            }
        }
    }

    actualizarContadorEscaleras() {
        if (this.cantidadEscaleras > 0) {
            this.cantidadEscaleras--; // Restar una escalera
            this.contadorEscaleras.setText(this.cantidadEscaleras); // Actualizar la UI
            return true; // Indica que se pudo colocar la escalera
        } else {
            console.log("⚠ No tienes más escaleras disponibles.");
            return false; // Indica que no se puede colocar
        }
    }

    update() {
        // Si el menú de la refineria está abierto, detener el personaje pero permitir cerrar el menú
        if (this.menuRefineriaContainer.visible) {
            this.player.setVelocity(0, 0);
            this.moving = false;

            // Permitir cerrar la refineria con la barra espaciadora
            if (Phaser.Input.Keyboard.JustDown(this.spaceKey)) {
                this.cerrarMenuRefineria();
            }

            return; // Evitar que se ejecute cualquier otro código de movimiento
        }

        // Si el menú del arsenal está abierto, detener el personaje pero permitir cerrar el menú
        if (this.menuArsenalContainer.visible) {
            this.player.setVelocity(0, 0);
            this.moving = false;

            // Permitir cerrar la refineria con la barra espaciadora
            if (Phaser.Input.Keyboard.JustDown(this.spaceKey)) {
                this.cerrarMenuArsenal();
            }

            return; // Evitar que se ejecute cualquier otro código de movimiento
        }

        // Obtener la posición actual del jugador en la cuadrícula
        const playerGridX = Math.floor(this.player.x / this.tileSize);
        const playerGridY = Math.floor(this.player.y / this.tileSize);

        // Si se pulsa la barra espaciadora (una sola vez)...
        if (Phaser.Input.Keyboard.JustDown(this.spaceKey)) {
            // Primero, si el jugador está en la celda de la refineria (3/4/5,2), se abre la refineria
            if ((playerGridX === 3 || playerGridX === 4 || playerGridX === 5) && playerGridY === 2) {
                console.log("🟢 Abriendo menú de la refineria...");
                this.abrirMenuRefineria();
                return; // Salir del update para no ejecutar más código en este frame
            }

            // abrir el arsenal al estar en las columnas 11-13 ---
            const buyStoreGridXMin = 11;
            const buyStoreGridXMax = 13;

            if ((playerGridX >= buyStoreGridXMin && playerGridX <= buyStoreGridXMax) && playerGridY === 2) {
                console.log("🟢 Abriendo menú del arsenal");
                this.abrirMenuArsenal();
                return; // Salir para evitar que se ejecute el resto del update
            }

            // Agregamos la restricción: si la fila es menor que 3, no se coloca escalera
            if (playerGridY < 3) {
                console.log("No se pueden poner escaleras por encima de la fila 3");
                return;
            }

            // Si no es la celda de la refineria, y la celda actual está vacía, se coloca una escalera
            if (this.grid[playerGridX] && this.grid[playerGridX][playerGridY] && this.grid[playerGridX][playerGridY].type === 'empty') {
                {
                    // Verificar si quedan escaleras antes de colocarla
                    if (this.actualizarContadorEscaleras()) {
                        this.grid[playerGridX][playerGridY].type = 'ladder';
                        this.grid[playerGridX][playerGridY].sprite = this.add.image(
                            playerGridX * this.tileSize,
                            playerGridY * this.tileSize,
                            'ladder'
                        )
                            .setOrigin(0)
                            .setDisplaySize(this.tileSize, this.tileSize)
                            .setDepth(1);
                    }
                }
            }
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

        if (this.cursors.left.isDown) {
            if (this.player.x > 0) {
                if (this.spaceKey.isDown) {
                    // Si ya se está moviendo sin escalera, cancelamos y reiniciamos con escalera
                    if (this.moving && !this.isLadderMovement && this.currentTween) {
                        this.currentTween.stop();
                        this.moving = false;
                        this.currentTween = null;
                    }
                    if (!this.moving) {
                        this.startMovementWithLadder(-tileSize, 0);
                    }
                } else {
                    if (!this.moving) {
                        this.startMovement(-tileSize, 0);
                    }
                }
            }
        } else if (this.cursors.right.isDown) {
            if (this.player.x < this.physics.world.bounds.width - tileSize) {
                if (this.spaceKey.isDown) {
                    if (this.moving && !this.isLadderMovement && this.currentTween) {
                        this.currentTween.stop();
                        this.moving = false;
                        this.currentTween = null;
                    }
                    if (!this.moving) {
                        this.startMovementWithLadder(tileSize, 0);
                    }
                } else {
                    if (!this.moving) {
                        this.startMovement(tileSize, 0);
                    }
                }
            }
        } else if (this.cursors.up.isDown) {
            if (this.player.y > 0) {
                if (this.spaceKey.isDown) {
                    // Si se pulsa espacio + flecha arriba, no permitimos mover hacia arriba si estamos en la superficie (fila 3)
                    if (gridY === 2) {
                        console.log("No se permite mover hacia arriba desde la superficie.");
                    } else {
                        if (this.moving && !this.isLadderMovement && this.currentTween) {
                            this.currentTween.stop();
                            this.moving = false;
                            this.currentTween = null;
                        }
                        if (!this.moving) {
                            this.startMovementWithLadder(0, -tileSize);
                        }
                    }
                } else {
                    // Movimiento normal hacia arriba: solo se permite si la celda actual es escalera
                    if (this.grid[gridX] && this.grid[gridX][gridY] && this.grid[gridX][gridY].type === 'ladder') {
                        if (!this.moving) {
                            this.startMovement(0, -tileSize);
                        }
                    }
                }
            }
        } else if (this.cursors.down.isDown) {
            if (this.player.y < this.physics.world.bounds.height - tileSize) {
                if (this.spaceKey.isDown) {
                    if (this.moving && !this.isLadderMovement && this.currentTween) {
                        this.currentTween.stop();
                        this.moving = false;
                        this.currentTween = null;
                    }
                    if (!this.moving) {
                        this.startMovementWithLadder(0, tileSize);
                    }
                } else {
                    if (!this.moving) {
                        this.startMovement(0, tileSize);
                    }
                }
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
        if (this.moving) return; // Evitar iniciar si ya está en movimiento
        this.moving = true;
        this.isLadderMovement = false;
        const tileSize = this.tileSize;
        const targetX = this.player.x + dx;
        const targetY = this.player.y + dy;

        const gridX = Math.floor(targetX / tileSize);
        const gridY = Math.floor(targetY / tileSize);

        // 🚨 Verificar si el destino está dentro de los límites de la cuadrícula
        if (!this.grid[gridX] || !this.grid[gridX][gridY]) {
            console.log("⛔ No puedes moverte fuera de los límites.");
            this.moving = false;
            return;
        }

        const targetBlock = this.grid[gridX][gridY].type;

        // 🚨 Verificar si el destino es un bloque de hierro antes de mover
        if (targetBlock === 'iron') {
            console.log("⛔ No puedes moverte sobre bloques de hierro.");
            this.moving = false;
            return;
        }

        // 🚨 Si el bloque de destino NO es vacío ni escalera, verificar si el pico puede minarlo
        if (targetBlock !== 'empty' && targetBlock !== 'ladder') {
            if (!this.materialesPermitidos[this.picoActual].includes(targetBlock)) {
                console.log(`❌ No puedes moverte sobre ${targetBlock} con tu ${this.picoActual}.`);
                this.moving = false;
                return;
            }
        }

        this.currentTween = this.tweens.add({
            targets: this.player,
            x: targetX,
            y: targetY,
            duration: 200,
            ease: 'Quadratic.Out',
            onComplete: () => {
                this.processBlock(gridX, gridY);
                this.moving = false;
                this.currentTween = null;
            }
        });
    }
    
    startMovementWithLadder(dx, dy) {
        if (this.moving) return;
        this.moving = true;
        this.isLadderMovement = true;
        const tileSize = this.tileSize;
        const targetX = this.player.x + dx;
        const targetY = this.player.y + dy;

        const gridX = Math.floor(targetX / tileSize);
        const gridY = Math.floor(targetY / tileSize);

        // 🚨 Verificar si el destino está dentro de los límites de la cuadrícula
        if (!this.grid[gridX] || !this.grid[gridX][gridY]) {
            console.log("⛔ No puedes moverte fuera de los límites.");
            this.moving = false;
            return;
        }

        const targetBlock = this.grid[gridX][gridY].type;

        // 🚨 Verificar si el destino es un bloque de hierro antes de mover
        if (targetBlock === 'iron') {
            console.log("⛔ No puedes moverte sobre bloques de hierro.");
            this.moving = false;
            return;
        }

        // 🚨 Si el bloque de destino NO es vacío ni escalera, verificar si el pico puede minarlo
        if (targetBlock !== 'empty' && targetBlock !== 'ladder') {
            if (!this.materialesPermitidos[this.picoActual].includes(targetBlock)) {
                console.log(`❌ No puedes moverte sobre ${targetBlock} con tu ${this.picoActual}.`);
                this.moving = false;
                return;
            }
        }

        this.currentTween = this.tweens.add({
            targets: this.player,
            x: targetX,
            y: targetY,
            duration: 200,
            ease: 'Quadratic.Out',
            onComplete: () => {
                this.processBlock(gridX, gridY);

                // ✅ Si el bloque de destino es vacío y se mantiene la barra espaciadora, colocar una escalera
                if (gridY >= 3 && this.cursors.space.isDown && this.cantidadEscaleras > 0 &&
                    this.grid[gridX] && this.grid[gridX][gridY] && this.grid[gridX][gridY].type === 'empty') {

                    if (this.actualizarContadorEscaleras()) {
                        this.grid[gridX][gridY].type = 'ladder';
                        this.grid[gridX][gridY].sprite = this.add.image(
                            gridX * this.tileSize,
                            gridY * this.tileSize,
                            'ladder'
                        ).setOrigin(0).setDisplaySize(tileSize, tileSize).setDepth(1);
                    }
                }

                this.moving = false;
                this.currentTween = null;
            }
        });
    }

    processBlock(gridX, gridY) {
        // 🚨 Verificar si el pico está roto antes de permitir minar
        if (this.durabilidadPico <= 0) {
            console.log("❌ No puedes minar más bloques, tu pico está roto.");
            return;
        }

        const block = (this.grid[gridX] && this.grid[gridX][gridY]) ? this.grid[gridX][gridY] : null;
        if (block) {
            // 🚨 Verificar si el bloque es de hierro antes de permitir el minado
            if (block.type === 'iron') {
                console.log("⛏️ No puedes minar este bloque de hierro.");
                return;
            }

            // 🚨 Verificar si el pico actual puede minar este bloque
            if (!this.materialesPermitidos[this.picoActual].includes(block.type)) {
                console.log(`❌ Tu ${this.picoActual} no puede minar ${block.type}.`);
                return;
            }

            // ✅ Reducir la durabilidad del pico en 1
            this.durabilidadPico -= 1;

            // ✅ Guardar el tipo del bloque antes de cambiarlo a `empty`
            const blockType = block.type;
            block.type = 'empty';

            // ✅ Recolectar minerales y actualizar la UI
            if (blockType === 'carbon') {
                this.carbonCount += 1;
                this.carbonText.setText(`Carbón: ${this.carbonCount}`);
            } else if (blockType === 'cobre') {
                this.cobreCount += 1;
                this.cobreText.setText(`Cobre: ${this.cobreCount}`);
            } else if (blockType === 'hierro') {
                this.hierroCount += 1;
                this.hierroText.setText(`Hierro: ${this.hierroCount}`);
            } else if (blockType === 'plata') {
                this.plataCount += 1;
                this.plataText.setText(`Plata: ${this.plataCount}`);
            } else if (blockType === 'oro') {
                this.oroCount = (this.oroCount || 0) + 1;
                this.oroText.setText(`Oro: ${this.oroCount}`);
            } else if (blockType === 'rubi') {
                this.rubiCount = (this.rubiCount || 0) + 1;
                this.rubiText.setText(`Rubí: ${this.rubiCount}`);
            } else if (blockType === 'esmeralda') {
                this.esmeraldaCount += 1;
                this.esmeraldaText.setText(`Esmeraldas: ${this.esmeraldaCount}`);
            } else if (blockType === 'diamante') {
                this.diamanteCount = (this.diamanteCount || 0) + 1;
                this.diamanteText.setText(`Diamantes: ${this.diamanteCount}`);
            }

            // ✅ Eliminar todos los sprites del bloque
            if (block.sprite) {
                block.sprite.destroy();
                block.sprite = null;
            }
            if (block.overlaySprite) {
                block.overlaySprite.destroy();
                block.overlaySprite = null;
            }
            if (block.baseSprite) {
                block.baseSprite.destroy();
                block.baseSprite = null;
            }

            // ✅ Actualizar la barra de durabilidad en la UI
            const porcentaje = this.durabilidadPico / this.durabilidadesPicos[this.picoActual];
            this.barraDurabilidad.setScale(porcentaje, 1);

            // ✅ Si la durabilidad llega a 0, el pico se rompe después de minar correctamente
            if (this.durabilidadPico <= 0) {
                console.log("❌ Tu pico se ha roto. No puedes minar más hasta comprar uno nuevo.");
                this.durabilidadPico = 0;
                this.barraDurabilidad.setScale(0, 1);
            }
        }
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