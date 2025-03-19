class MenuScene extends Phaser.Scene {
    constructor() {
        super('MenuScene');
    }

    preload() {
        this.load.image('fondoMenu', 'assets/fondoMenu.png'); // Reemplaza 'fondoMenu.png' con el nombre del archivo que subiste
        this.load.image('google_logo', 'assets/google_logo.png'); // Asegúrate de cargar 'google_logo.png' en preload()
    }

    create() {
        // Agregar el fondo del menú
        this.add.image(this.cameras.main.width / 2, this.cameras.main.height / 2, 'fondoMenu')
            .setOrigin(0.5)
            .setDisplaySize(this.cameras.main.width, this.cameras.main.height);

        this.add.text(this.cameras.main.width / 2, this.cameras.main.height / 3 + 20, 'Miner Madness',
            { fontSize: '48px', fill: '#000', fontStyle: 'bold' })
            .setOrigin(0.5);

        // ✅ Botón "Invitado"
        this.botonInvitado = this.crearBotonMenu(
            250, 55,
            this.cameras.main.width / 2, this.cameras.main.height / 2,
            "Jugar como invitado",
            () => {
                const confirmPlay = window.confirm("Estás jugando como invitado. Tu progreso NO se guardará. ¿Quieres continuar?");

                if (confirmPlay) {
                    console.log("🎮 Iniciando partida invitado...");
                    this.scene.start("GameScene", { modo: "nueva" });
                }
            }
        ).setVisible(false);;

        // ✅ Botón "Nueva Iniciar"
        this.botonIniciar = this.crearBotonMenu(
            250, 55,
            this.cameras.main.width / 2, this.cameras.main.height / 2,
            "Nueva partida",
            () => {
                console.log("🎮 Iniciando partida nueva...");
                this.scene.start("GameScene", { modo: "nueva" });
            }
        ).setVisible(false);;

        // ✅ Botón "Continuar"
        this.botonContinuar = this.crearBotonMenu(
            250, 55,
            this.cameras.main.width / 2 - 160, this.cameras.main.height / 2,
            "Continuar partida",
            () => {
                console.log("🎮 Continuando partida...");
                this.scene.start("GameScene", { modo: "continuar" });
            }
        ).setVisible(false);;

        // ✅ Botón "Nueva partida"
        this.botonNueva = this.crearBotonMenu(
            250, 55,
            this.cameras.main.width / 2 + 160, this.cameras.main.height / 2,
            "Nueva partida",
            () => {
                console.log("🎮 Iniciando partida nueva...");
                this.scene.start("GameScene", { modo: "sobreescribir" });
            }
        ).setVisible(false);;

        // 🔹 Crear el botón de Google en la esquina superior derecha
        this.googleButtonContainer = this.add.container(this.cameras.main.width - 150, 50).setSize(200, 50);

        const buttonBackground = this.add.rectangle(0, 0, 200, 50, 0xffffff)
            .setOrigin(0.5)
            .setStrokeStyle(2, 0xdddddd);

        const googleLogo = this.add.image(-70, 0, 'google_logo')
            .setDisplaySize(30, 30)
            .setOrigin(0.5);

        this.loginText = this.add.text(20, 0, "Iniciar sesión", {
            fontSize: "20px",
            fill: "#000",
            fontFamily: "Arial",
            fontStyle: "bold"
        }).setOrigin(0.5);

        this.googleButtonContainer.add([buttonBackground, googleLogo, this.loginText]);

        // 🔹 Hacer que el fondo del botón sea interactivo
        buttonBackground.setInteractive({ useHandCursor: true });

        // 🔹 Detectar cambios en la autenticación
        window.firebaseAuth.onAuthStateChanged((user) => {
            console.log("🔒 Estado de autenticación cambiado:", user ? "Usuario autenticado" : "Usuario NO autenticado");

            if (user) {
                // ✅ Usuario autenticado: Cambiar a "Cerrar sesión"
                this.loginText.setText("Cerrar sesión");
                buttonBackground.off("pointerdown");
                buttonBackground.on("pointerdown", () => logoutUser());
                // ✅ Usuario SÍ autenticado: Cambiar a "Continuar partida"

                // ✅ Verificar si hay una partida guardada en Firebase
                window.firebaseDB.collection("partidas").doc(user.uid).get().then((doc) => {
                    if (doc.exists) {
                        console.log("✅ Partida guardada encontrada:", doc.data());

                        this.botonInvitado.setVisible(false);
                        this.botonIniciar.setVisible(false);
                        this.botonContinuar.setVisible(true);
                        this.botonNueva.setVisible(true);
                    } else {
                        console.log("⚠ No hay partida guardada.");
                        this.botonInvitado.setVisible(false);
                        this.botonIniciar.setVisible(true);
                        this.botonContinuar.setVisible(false);
                        this.botonNueva.setVisible(false);
                    }
                }).catch((error) => {
                    console.error("❌ Error al verificar partida guardada:", error);
                });
            } else {
                // ❌ No autenticado: Cambiar a "Iniciar sesión"
                this.loginText.setText("Iniciar sesión");
                buttonBackground.off("pointerdown");
                buttonBackground.on("pointerdown", () => loginWithGoogle());
                // ❌ Usuario NO autenticado: Mostrar "Jugar como invitado"
                this.botonInvitado.setVisible(true);
                this.botonIniciar.setVisible(false);
                this.botonContinuar.setVisible(false);
                this.botonNueva.setVisible(false);
            }
        });

        // Añadir el cartel con tu nombre en color crema
        this.add.text(
            this.cameras.main.width / 2, // Centrado en X
            this.cameras.main.height / 2 + 80, // Posicionar debajo del botón
            'Hecho por: Nicolás Rodríguez Ferrándiz',
            { fontSize: '24px', fill: '#f5deb3', fontStyle: 'bold' } // Color crema y estilo en negrita
        ).setOrigin(0.5);
    }

    crearBotonMenu(ancho, alto, posX, posY, texto, callback) {
        // ✅ Crear el fondo del botón (rectángulo con bordes redondeados)
        const buttonBackground = this.add.rectangle(
            0, 0, ancho, alto, 0x8B4513 // 📌 Color marrón oscuro
        )
            .setOrigin(0.5)
            .setStrokeStyle(4, 0x5A3825) // 📌 Borde oscuro
            .setInteractive({ useHandCursor: true }); // 📌 Hacerlo interactivo

        // ✅ Crear el texto del botón
        const buttonText = this.add.text(
            0, 0, texto,
            {
                fontSize: "24px",
                fill: "#FFFFFF",
                fontFamily: "Arial",
                fontStyle: "bold"
            }
        ).setOrigin(0.5);

        // ✅ Hacer que el botón responda a clics
        buttonBackground.on("pointerdown", () => {
            console.log(`🎮 Botón "${texto}" presionado`);
            if (callback) {
                callback(); // 📌 Ejecutar la función asociada al botón
            }
        });

        // ✅ Efectos visuales al pasar el ratón por encima
        buttonBackground.on("pointerover", () => {
            buttonBackground.setFillStyle(0xA0522D); // 📌 Color más claro al pasar el mouse
        });
        buttonBackground.on("pointerout", () => {
            buttonBackground.setFillStyle(0x8B4513); // 📌 Color original al salir
        });

        // ✅ Crear un contenedor y añadir los elementos dentro
        const buttonContainer = this.add.container(posX, posY, [buttonBackground, buttonText]);

        return buttonContainer; // 📌 Retornamos el contenedor
    }
}

function loginWithGoogle() {
    if (!window.firebaseAuth) {
        console.error("❌ Firebase aún no está listo. Esperando...");
        setTimeout(loginWithGoogle, 500); // Reintentar en 500ms
        return;
    }

    const provider = new window.firebase.auth.GoogleAuthProvider();

    window.firebaseAuth.signInWithPopup(provider)
        .then((result) => {
            const user = result.user;
            console.log("✅ Usuario autenticado:", user.displayName);
        })
        .catch((error) => {
            console.error("❌ Error en autenticación:", error.message);
        });
}

function logoutUser() {
    window.firebaseAuth.signOut()
        .then(() => {
            console.log("✅ Usuario ha cerrado sesión.");
        })
        .catch((error) => {
            console.error("❌ Error al cerrar sesión:", error.message);
        });
}

function guardarPartida() {
    if (!window.firebaseDB) {
        console.error("❌ Firestore aún no está listo. Reintentando en 500ms...");
        setTimeout(guardarPartida, 500); // Reintentar después de 500ms
        return;
    }
    const notificacion = mostrarNotificacion("💾 Tu partida se está guardando en la nube. Por favor, espera...");

    const user = window.firebaseAuth.currentUser;

    if (!user) {
        alert("❌ Debes iniciar sesión para guardar tu partida.");
        return;
    }

    // 🔹 Obtener la escena del juego
    const gameScene = game.scene.scenes.find(scene => scene.scene.key === "GameScene");

    if (!gameScene) {
        console.error("❌ No se encontró la escena del juego.");
        return;
    }

    // 🔹 Generar el gridState con solo celdas modificadas
    let gridState = [];
    for (let x = 0; x < gameScene.grid.length; x++) {
        for (let y = 0; y < gameScene.grid[x].length; y++) {
            const cellType = gameScene.grid[x][y].type;

            // Solo guardamos celdas que no sean tierra ni piedra
            if (cellType !== 'tierra' && cellType !== 'piedra') {
                gridState.push({ x, y, type: cellType });
            }
        }
    }

    // 🔹 Obtener los datos reales del juego
    const datosPartida = {
        posX: Math.floor(gameScene.player.x / gameScene.tileSize),
        posY: Math.floor(gameScene.player.y / gameScene.tileSize),
        inventario: {
            carbon: gameScene.carbonCount,
            cobre: gameScene.cobreCount,
            hierro: gameScene.hierroCount,
            plata: gameScene.plataCount,
            oro: gameScene.oroCount,
            rubi: gameScene.rubiCount,
            esmeralda: gameScene.esmeraldaCount,
            diamante: gameScene.diamanteCount
        },
        monedas: gameScene.monedas,
        picoTipo: gameScene.picoActual,
        picoDurabilidad: gameScene.durabilidadPico,
        vida: gameScene.health,
        escaleras: gameScene.cantidadEscaleras,
        gridState: gridState // 📌 Guardamos el estado del grid modificado
    };

    console.log("📌 Datos de la partida a guardar:", datosPartida);

    // 🔹 Guardar en Firestore en la colección "partidas"
    window.firebaseDB.collection("partidas").doc(user.uid).set(datosPartida)
        .then(() => {
            console.log("✅ Partida guardada correctamente.");
            notificacion.remove();
            mostrarNotificacion("✅ Tu partida ha sido guardada en la nube.", true);
        })
        .catch((error) => {
            console.error("❌ Error al guardar partida:", error);
        });
}

function mostrarNotificacion(mensaje, autoEliminar = false) {
    const notification = document.createElement("div");
    notification.innerText = mensaje;
    notification.style.position = "fixed";
    notification.style.top = "20px"; // 🔹 Aparece en la parte superior
    notification.style.left = "50%"; // 🔹 Centrar horizontalmente
    notification.style.transform = "translateX(-50%)"; // 🔹 Ajustar al centro
    notification.style.background = "rgba(0, 0, 0, 0.8)";
    notification.style.color = "white";
    notification.style.padding = "10px 20px";
    notification.style.borderRadius = "5px";
    notification.style.fontSize = "16px";
    notification.style.zIndex = "1000";
    document.body.appendChild(notification);

    if (autoEliminar === true) {
        setTimeout(() => {
            notification.remove();
        }, 1000); // 🔹 Desaparece después de 3 segundos
    }

    return notification;
}

function cargarPartida(userId) {
    if (!window.firebaseDB) {
        console.error("❌ Firestore no está disponible todavía.");
        return;
    }

    window.firebaseDB.collection("partidas").doc(userId).get()
        .then((doc) => {
            const gameScene = game.scene.getScene("GameScene");
            if (doc.exists) {
                console.log("✅ Partida encontrada en la base de datos:", doc.data());

                if (!gameScene) {
                    console.error("❌ No se encontró la escena del juego.");
                    return;
                }

                const datos = doc.data();

                // 🔹 Cargar los datos en el juego
                gameScene.player.setPosition(datos.posX * gameScene.tileSize, datos.posY * gameScene.tileSize);
                gameScene.carbonCount = datos.inventario.carbon || 0;
                gameScene.cobreCount = datos.inventario.cobre || 0;
                gameScene.hierroCount = datos.inventario.hierro || 0;
                gameScene.plataCount = datos.inventario.plata || 0;
                gameScene.oroCount = datos.inventario.oro || 0;
                gameScene.rubiCount = datos.inventario.rubi || 0;
                gameScene.esmeraldaCount = datos.inventario.esmeralda || 0;
                gameScene.diamanteCount = datos.inventario.diamante || 0;
                gameScene.monedas = datos.monedas || 0;
                gameScene.picoActual = datos.picoTipo || "pico_madera";
                gameScene.iconoPico.setTexture(gameScene.picoActual); // 🔹 Actualizar la imagen del icono del pico
                gameScene.durabilidadPico = datos.picoDurabilidad || 100;
                // 🔹 Actualizar la barra de durabilidad en la UI
                const durabilidadMaxima = gameScene.durabilidadesPicos[gameScene.picoActual] || 100;
                const porcentajeDurabilidad = gameScene.durabilidadPico / durabilidadMaxima;
                gameScene.barraDurabilidad.setScale(porcentajeDurabilidad, 1);
                gameScene.health = datos.vida || 100;
                gameScene.cantidadEscaleras = datos.escaleras || 0;

                // 🔹 Actualizar la UI
                gameScene.contadorEscaleras.setText(gameScene.cantidadEscaleras);
                gameScene.healthBar.clear()
                    .fillStyle(0x00ff00, 1)
                    .fillRoundedRect(52, 42, (gameScene.health / 100) * 200, 12, 6);

                // 🔹 Aplicar el gridState sobre el mundo generado aleatoriamente
                if (datos.gridState) {
                    console.log("🔄 Aplicando gridState...");
                    for (const cell of datos.gridState) {
                        const { x, y, type } = cell;

                        // 🟢 Luego, aplicamos la celda guardada
                        gameScene.grid[x][y].type = type;

                        // ✅ Si la celda tenía una escalera, la recreamos visualmente
                        if (type == "ladder") {
                            gameScene.grid[x][y].sprite = gameScene.add.image(
                                x * gameScene.tileSize,
                                y * gameScene.tileSize,
                                "ladder"
                            ).setOrigin(0).setDisplaySize(gameScene.tileSize, gameScene.tileSize);
                        }
                    }
                }
                gameScene.fillMaterials(); // 🟢 Rellenar los materiales faltantes

                console.log("✅ Grid restaurado exitosamente.");
                console.log("🔹 Partida cargada con éxito.");
            } else {
                console.log("ℹ No hay partida guardada. Se iniciará una nueva.");
                gameScene.generateRandomMaterial();
            }
            // 🔹 Ocultar el panel de carga cuando los datos estén listos
            if (gameScene.loadingContainer) {
                gameScene.loadingContainer.setVisible(false);
            }
        })
        .catch((error) => {
            console.error("❌ Error al cargar partida:", error);
            const gameScene = game.scene.getScene("GameScene");
            gameScene.generateRandomMaterial();
            // 🔹 Ocultar el panel de carga cuando los datos estén listos
            if (gameScene.loadingContainer) {
                gameScene.loadingContainer.setVisible(false);
            }
        });
}

class GameScene extends Phaser.Scene {
    constructor() {
        super('GameScene');
        this.moving = false;
        this.currentTween = null;
        this.teclasHabilitadas = true; // Asegurar que las teclas están activas después de reiniciar        
        this.isLadderMovement = false; // Indicará si el movimiento actual es con escalera
    }

    init(data) {
        this.modoInicio = data.modo;
        console.log("🔄 Iniciando GameScene con modo de inicio:", this.modoInicio);
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
        this.load.image('boton_ayuda', 'assets/boton_ayuda.png'); // Cargar el botón de ayuda
        this.load.image('boton_logros', 'assets/boton_logros.png'); // 📌 Asegúrate de que la ruta es correcta
    }

    create() {
        console.log("🎮 Iniciando GameScene...");

        this.events.on('shutdown', () => {
            console.log("🚪 GameScene cerrada. Deteniendo música...");

            if (this.sounds) {
                this.sounds.forEach(sound => {
                    if (sound.isPlaying) {
                        sound.stop();
                    }
                });
            }
        });

        // 🔹 Crear un contenedor para el panel de carga
        this.loadingContainer = this.add.container(
            this.cameras.main.scrollX + this.cameras.main.width / 2,
            this.cameras.main.scrollY + this.cameras.main.height / 2
        ).setVisible(false);

        // 🔹 Crear el fondo negro dentro del contenedor
        const background = this.add.rectangle(
            0, 0, // Posición relativa dentro del container
            this.cameras.main.width, // Ancho igual al de la cámara
            this.cameras.main.height, // Alto igual al de la cámara
            0x000000, // Color negro
            1 // Opacidad 100%
        ).setOrigin(0.5);

        // 🔹 Crear el texto de "Cargando partida..."
        const loadingText = this.add.text(0, 0, "Cargando partida...", {
            fontSize: "24px",
            fill: "#ffffff",
            fontFamily: "Arial",
            fontStyle: "bold"
        }).setOrigin(0.5);

        // 🔹 Añadir el fondo negro y el texto al contenedor
        this.loadingContainer.add([background, loadingText]);

        // 🔹 Asegurar que el panel esté al frente de todo
        this.loadingContainer.setDepth(1000);

        // Detectar la tecla ESC para alternar entre pausa y juego
        this.input.keyboard.on("keydown-P", () => {
            if (this.scene.isActive("PauseMenu")) {
                // 🔹 Si el menú de pausa ya está abierto, cerrarlo y reanudar el juego
                this.scene.stop("PauseMenu");
                this.scene.resume();
            } else {
                // 🔹 Si el menú de pausa NO está abierto, pausamos el juego y lo abrimos
                this.scene.pause();
                this.scene.launch("PauseMenu");
            }
        });

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

        // Añadir el personaje
        this.player = this.physics.add.sprite(8 * this.tileSize, 2 * this.tileSize, 'personaje')
            .setOrigin(0)
            .setDepth(5); // Profundidad correcta para estar debajo del menú pero sobre otros elementos
        this.player.displayWidth = this.tileSize; // Ajustar ancho al tamaño de la cuadrícula
        this.player.displayHeight = this.tileSize; // Ajustar alto al tamaño de la cuadrícula
        this.player.setCollideWorldBounds(true);

        // ✅ Asegurar que el jugador comienza en la posición correcta (8,2)
        this.player.setPosition(this.tileSize * 8, this.tileSize * 2);
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

        this.juegoTerminado = false; // 🔹 Controla si ya se ha mostrado la pantalla de finalización

        // Crear contadores de minerales recolectados
        this.carbonCount = 0; // Inicializar contador de carbón recolectado
        this.cobreCount = 0; // Inicializar contador de cobre
        this.hierroCount = 0; // Inicializar contador de hierro
        this.plataCount = 0; // Inicializar contador de plata
        this.oroCount = 0; // Inicializar contador de oro
        this.rubiCount = 0; // Inicializar contador de rubí
        this.esmeraldaCount = 0; // Inicializar contador de esmeraldas
        this.diamanteCount = 0; // Inicializar contador de diamantes

        // ✅ Evento de teclado para abrir/cerrar la mochila con "M"
        this.input.keyboard.on('keydown-M', () => {
            if (!this.scene.isActive("MochilaScene")) {
                this.scene.launch("MochilaScene"); // Abrir la escena de la mochila
            }
        });

        // ✅ Tamaño de los botones
        const buttonSize = 75;

        // ✅ Botón de ayuda en la interfaz del juego
        this.botonAyuda = this.add.image(
            this.cameras.main.width - buttonSize / 2 - 10, // 📌 Derecha de la pantalla
            buttonSize / 2 + 10, // 📌 Arriba de la pantalla
            'boton_ayuda'
        )
            .setOrigin(0.5)
            .setInteractive({ useHandCursor: true })
            .setDisplaySize(buttonSize, buttonSize)
            .setScrollFactor(0) // 📌 Fijarlo en la interfaz
            .setDepth(15);

        this.botonAyuda.on("pointerdown", () => {
            console.log("📖 Abriendo pantalla de ayuda...");
            this.scene.launch("HelpScene");
        });

        // ✅ Botón de logros (colocado a la izquierda del de ayuda)
        this.botonLogros = this.add.image(
            this.botonAyuda.x - buttonSize - 10, // 📌 Justo a la izquierda del botón de ayuda
            this.botonAyuda.y, // 📌 Misma altura
            'boton_logros'
        )
            .setOrigin(0.5)
            .setInteractive({ useHandCursor: true })
            .setDisplaySize(buttonSize, buttonSize)
            .setScrollFactor(0) // 📌 Fijarlo en la interfaz
            .setDepth(15);

        this.botonLogros.on("pointerdown", () => {
            console.log("🏆 Abriendo pantalla de logros...");
            this.scene.launch("LogrosScene");
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

        // Crear los bloques de hierro
        const tiendas = [
            { x: [3, 4, 5], y: 2 }, // Tienda de vender (bloques en X=3, 4 y 5)
            { x: [11, 12, 13], y: 2 } // Tienda de comprar (bloques en X=11, 12 y 13)
        ];

        tiendas.forEach(tienda => {
            tienda.x.forEach(tiendaX => { // Iterar sobre cada X en la tienda
                const tiendaY = tienda.y + 1; // Justo debajo de la tienda

                // 🔹 Crear bloque de hierro como un sprite en lugar de un objeto de Physics
                const bloque = this.add.image(tiendaX * this.tileSize, tiendaY * this.tileSize, 'bloque_hierro')
                    .setOrigin(0)
                    .setDisplaySize(this.tileSize, this.tileSize)
                    .setDepth(1); // Mantenerlo en el fondo

                // 🔹 Guardar el bloque en la grid
                this.grid[tiendaX][tiendaY] = { type: 'iron', sprite: bloque };
            });
        });

        // Cargar partida si el usuario está autenticado
        if (this.modoInicio === "continuar") {
            const user = window.firebaseAuth.currentUser;
            if (user) {
                console.log("🔹 Usuario autenticado, cargando partida...");
                this.loadingContainer.setVisible(true);
                cargarPartida(user.uid);
            } else {
                console.log("ℹ Usuario no autenticado, iniciando nueva partida.");
                this.generateRandomMaterial();
            }
        } else {
            console.log("🆕 Iniciando nueva partida...");
            this.generateRandomMaterial();
        }
    }

    generateRandomMaterial() {
        const tileSize = 128;
        const gridSize = 175;

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

        this.fillMaterials();
    }

    fillMaterials() {
        const tileSize = 128;
        const gridSize = 175;
        for (let x = 0; x < gridSize; x++) {
            for (let y = 0; y < gridSize; y++) {
                if (this.grid[x][y].type === 'empty' || this.grid[x][y].type === 'ladder') {
                    continue;
                }

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
                    .setOrigin(0)
                    .setDepth(-1);// Asegurar que esté detrás de otros elementos
            }
        }
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
        console.log("🟢 Abriendo RefineriaMenuScene...");

        // 🔹 Pausar GameScene y lanzar la escena de la Refinería
        this.scene.pause();
        this.scene.launch('RefineriaMenuScene');
    }

    abrirMenuArsenal() {
        console.log("🟢 Abriendo ArsenalMenuScene...");

        // 🔹 Pausar GameScene y lanzar la escena del Arsenal
        this.scene.pause();
        this.scene.launch('ArsenalMenuScene');
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
        if (this.loadingContainer) {
            this.loadingContainer.setPosition(
                this.cameras.main.scrollX + this.cameras.main.width / 2,
                this.cameras.main.scrollY + this.cameras.main.height / 2
            );

            // 🔹 Si la pantalla de carga ya no es visible, eliminarla del update
            if (!this.loadingContainer.visible) {
                console.log("✅ Pantalla de carga eliminada del update.");
                this.loadingContainer.destroy();
                this.loadingContainer = null;
            }
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
            // Girar la textura a la izquierda
            this.player.setFlipX(true); // Girar a la izquierda

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
            // Girar la textura a la derecha
            this.player.setFlipX(false); // Girar a la derecha

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
        let nextIndex;

        // 🔹 Elegir un índice aleatorio distinto al actual
        do {
            nextIndex = Phaser.Math.Between(0, this.sounds.length - 1);
        } while (nextIndex === this.currentSoundIndex);

        this.currentSoundIndex = nextIndex;
        const currentSound = this.sounds[this.currentSoundIndex];

        currentSound.play();
        currentSound.once('complete', () => {
            this.playNextSound(); // Reproduce el siguiente sonido
        });
    }

    startMovement(dx, dy) {
        if (this.moving) return; // Evitar iniciar si ya está en movimiento

        const tileSize = this.tileSize;
        const targetX = this.player.x + dx;
        const targetY = this.player.y + dy;
        const gridX = Math.floor(targetX / tileSize);
        const gridY = Math.floor(targetY / tileSize);

        // 🚨 Verificar si el destino está dentro de los límites de la cuadrícula
        if (!this.grid[gridX] || !this.grid[gridX][gridY]) {
            console.log("⛔ No puedes moverte fuera de los límites.");
            return;
        }

        const targetBlock = this.grid[gridX][gridY].type;

        // 🚨 Lista de minerales válidos
        const mineralesValidos = ['carbon', 'cobre', 'hierro', 'plata', 'oro', 'rubi', 'esmeralda', 'diamante'];

        // 🚨 Bloquear movimiento si el bloque de destino es hierro
        if (targetBlock === 'iron') {
            console.log("⛔ No puedes atravesar hierro.");
            return;
        }

        // 🚨 Si el bloque de destino es un mineral y el pico no puede minarlo, mostrar advertencia y bloquear movimiento
        if (mineralesValidos.includes(targetBlock) && !this.materialesPermitidos[this.picoActual].includes(targetBlock)) {
            console.log(`⚠ No puedes minar ${targetBlock} con ${this.picoActual}. Mostrando advertencia...`);

            if (!this.scene.isActive("WarningScene")) {
                this.scene.launch("WarningScene", {
                    mineral: targetBlock,
                    pico: this.picoActual.replace("pico_", "") // Eliminar "pico_" para mejor visualización
                });
            }
            return; // ❌ No permitimos moverse si el mineral no puede ser minado
        }

        this.moving = true;
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

        const tileSize = this.tileSize;
        const targetX = this.player.x + dx;
        const targetY = this.player.y + dy;
        const gridX = Math.floor(targetX / tileSize);
        const gridY = Math.floor(targetY / tileSize);

        // 🚨 Verificar si el destino está dentro de los límites de la cuadrícula
        if (!this.grid[gridX] || !this.grid[gridX][gridY]) {
            console.log("⛔ No puedes moverte fuera de los límites.");
            return;
        }

        const targetBlock = this.grid[gridX][gridY].type;

        // 🚨 Lista de minerales válidos
        const mineralesValidos = ['carbon', 'cobre', 'hierro', 'plata', 'oro', 'rubi', 'esmeralda', 'diamante'];

        // 🚨 Bloquear movimiento si el bloque de destino es hierro
        if (targetBlock === 'iron') {
            console.log("⛔ No puedes atravesar hierro.");
            return;
        }

        // 🚨 Si el bloque de destino es un mineral y el pico no puede minarlo, mostrar advertencia y bloquear movimiento
        if (mineralesValidos.includes(targetBlock) && !this.materialesPermitidos[this.picoActual].includes(targetBlock)) {
            console.log(`⚠ No puedes minar ${targetBlock} con ${this.picoActual}. Mostrando advertencia...`);

            if (!this.scene.isActive("WarningScene")) {
                this.scene.launch("WarningScene", {
                    mineral: targetBlock,
                    pico: this.picoActual.replace("pico_", "") // Eliminar "pico_" para mejor visualización
                });
            }
            return; // ❌ No permitimos moverse si el mineral no puede ser minado
        }

        this.moving = true;
        this.currentTween = this.tweens.add({
            targets: this.player,
            x: targetX,
            y: targetY,
            duration: 200,
            ease: 'Quadratic.Out',
            onComplete: () => {
                this.processBlock(gridX, gridY);

                // ✅ Solo intentar colocar una escalera si hay disponibles
                if (this.cantidadEscaleras > 0) {
                    if (this.cursors.space.isDown && gridY >= 3 &&
                        this.grid[gridX] && this.grid[gridX][gridY] &&
                        this.grid[gridX][gridY].type === 'empty') {

                        if (this.actualizarContadorEscaleras()) {
                            this.grid[gridX][gridY].type = 'ladder';
                            this.grid[gridX][gridY].sprite = this.add.image(
                                gridX * this.tileSize,
                                gridY * this.tileSize,
                                'ladder'
                            ).setOrigin(0).setDisplaySize(tileSize, tileSize).setDepth(1);
                        }
                    }
                } else {
                    console.log("🚨 No tienes más escaleras, pero puedes seguir moviéndote.");
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
            // 🚨 Evitar eliminar escaleras
            if (block.type === 'empty' || block.type === 'ladder') {
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
            } else if (blockType === 'cobre') {
                this.cobreCount += 1;
            } else if (blockType === 'hierro') {
                this.hierroCount += 1;
            } else if (blockType === 'plata') {
                this.plataCount += 1;
            } else if (blockType === 'oro') {
                this.oroCount += 1;
            } else if (blockType === 'rubi') {
                this.rubiCount += 1;
            } else if (blockType === 'esmeralda') {
                this.esmeraldaCount += 1;
            } else if (blockType === 'diamante') {
                this.diamanteCount += 1;
            }

            // ✅ Eliminar todos los sprites del bloque, excepto las escaleras
            if (block.type !== 'ladder') {
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

            // ✅ Comprobar si se han minado todos los minerales
            this.verificarFinDelJuego();
        }
    }

    verificarFinDelJuego() {
        if (this.juegoTerminado) return; // 🔹 Evitar que se ejecute más de una vez

        for (let x = 0; x < this.grid.length; x++) {
            for (let y = 0; y < this.grid[x].length; y++) {
                if (this.grid[x][y] && ['carbon', 'cobre', 'hierro', 'plata', 'oro', 'rubi', 'esmeralda', 'diamante'].includes(this.grid[x][y].type)) {
                    return; // 🚨 Aún quedan minerales, el juego no ha terminado
                }
            }
        }

        // ✅ Todos los minerales han sido minados, activar la escena de victoria
        this.juegoTerminado = true;
        this.scene.pause(); // Pausar GameScene
        this.scene.launch("VictoryScene"); // Iniciar la escena de victoria
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
}

class MochilaScene extends Phaser.Scene {
    constructor() {
        super({ key: 'MochilaScene' });
    }

    create() {
        console.log("🎒 Mochila abierta");

        const gameScene = this.scene.get('GameScene');
        if (gameScene) {
            this.scene.pause('GameScene'); // Pausar el juego
        }

        // ✅ Fondo semitransparente
        const overlay = this.add.rectangle(
            this.cameras.main.width / 2,
            this.cameras.main.height / 2,
            this.cameras.main.width,
            this.cameras.main.height,
            0x000000,
            0.7
        ).setDepth(100);

        // ✅ Borde de la mochila
        const border = this.add.rectangle(
            this.cameras.main.width / 2,
            this.cameras.main.height / 2,
            this.cameras.main.width - 375,
            this.cameras.main.height - 75,
            0x5A3825
        ).setDepth(101).setStrokeStyle(4, 0x000000);

        // ✅ Panel de la mochila
        const panel = this.add.rectangle(
            this.cameras.main.width / 2,
            this.cameras.main.height / 2,
            this.cameras.main.width - 400,
            this.cameras.main.height - 100,
            0xFFF0C9
        ).setDepth(101).setStrokeStyle(4, 0x000000);

        // ✅ Texto "Mochila"
        this.add.text(
            this.cameras.main.width / 2,
            this.cameras.main.height / 2 - 240,
            "Mochila 🎒",
            {
                fontSize: "64px",
                fill: "#000",
                fontFamily: "Arial",
                fontStyle: "bold"
            }
        ).setOrigin(0.5).setDepth(102);

        // ✅ Contenedores de inventario (solo ejemplo, puedes mejorarlo)
        this.add.text(
            this.cameras.main.width / 2 - 300,
            this.cameras.main.height / 2 - 90,
            `Carbón: ${gameScene.carbonCount}`,
            { fontSize: "40px", fill: "#000", fontFamily: "Arial" }
        ).setOrigin(0.5).setDepth(102);

        this.add.text(
            this.cameras.main.width / 2 - 300,
            this.cameras.main.height / 2 - 30,
            `Cobre: ${gameScene.cobreCount}`,
            { fontSize: "40px", fill: "#000", fontFamily: "Arial" }
        ).setOrigin(0.5).setDepth(102);

        this.add.text(
            this.cameras.main.width / 2 - 300,
            this.cameras.main.height / 2 + 30,
            `Hierro: ${gameScene.hierroCount}`,
            { fontSize: "40px", fill: "#000", fontFamily: "Arial" }
        ).setOrigin(0.5).setDepth(102);

        this.add.text(
            this.cameras.main.width / 2 - 300,
            this.cameras.main.height / 2 + 90,
            `Plata: ${gameScene.plataCount}`,
            { fontSize: "40px", fill: "#000", fontFamily: "Arial" }
        ).setOrigin(0.5).setDepth(102);

        this.add.text(
            this.cameras.main.width / 2 + 300,
            this.cameras.main.height / 2 - 90,
            `Oro: ${gameScene.oroCount || 0}`,
            { fontSize: "40px", fill: "#000", fontFamily: "Arial" }
        ).setOrigin(0.5).setDepth(102);

        this.add.text(
            this.cameras.main.width / 2 + 300,
            this.cameras.main.height / 2 - 30,
            `Rubí: ${gameScene.rubiCount || 0}`,
            { fontSize: "40px", fill: "#000", fontFamily: "Arial" }
        ).setOrigin(0.5).setDepth(102);

        this.add.text(
            this.cameras.main.width / 2 + 300,
            this.cameras.main.height / 2 + 30,
            `Esmeralda: ${gameScene.esmeraldaCount || 0}`,
            { fontSize: "40px", fill: "#000", fontFamily: "Arial" }
        ).setOrigin(0.5).setDepth(102);

        this.add.text(
            this.cameras.main.width / 2 + 300,
            this.cameras.main.height / 2 + 90,
            `Diamante: ${gameScene.diamanteCount || 0}`,
            { fontSize: "40px", fill: "#000", fontFamily: "Arial" }
        ).setOrigin(0.5).setDepth(102);

        // ✅ Botón de cerrar con "M"
        this.input.keyboard.on('keydown-M', () => {
            this.cerrarMochila();
        });
    }

    cerrarMochila() {
        console.log("🎒 Mochila cerrada");

        const gameScene = this.scene.get('GameScene');
        if (gameScene) {
            this.scene.resume('GameScene'); // Reanudar el juego
        }

        this.scene.stop(); // Cerrar la mochila
    }
}

class HelpScene extends Phaser.Scene {
    constructor() {
        super({ key: 'HelpScene' });
    }

    create() {
        console.log("📖 Pantalla de ayuda abierta");

        // ✅ Obtener la escena del juego
        const gameScene = this.scene.get('GameScene');
        if (gameScene) {
            this.scene.pause('GameScene'); // Pausar el juego mientras la ayuda está abierta
            gameScene.input.keyboard.enabled = false; // Bloquear las teclas
        }

        // ✅ Fondo semitransparente
        const overlay = this.add.rectangle(
            this.cameras.main.width / 2,
            this.cameras.main.height / 2,
            this.cameras.main.width,
            this.cameras.main.height,
            0x000000,
            0.7
        ).setDepth(100);

        // ✅ Borde de la ayuda
        const border = this.add.rectangle(
            this.cameras.main.width / 2,
            this.cameras.main.height / 2,
            this.cameras.main.width - 325,
            this.cameras.main.height - 100,
            0x5A3825
        ).setDepth(101).setStrokeStyle(4, 0x000000);

        // ✅ Panel de la ayuda
        const panel = this.add.rectangle(
            this.cameras.main.width / 2,
            this.cameras.main.height / 2,
            this.cameras.main.width - 350,
            this.cameras.main.height - 125,
            0xFFF0C9
        ).setDepth(101).setStrokeStyle(4, 0x000000);

        // ✅ Título "Ayuda"
        this.add.text(
            this.cameras.main.width / 2,
            this.cameras.main.height / 2 - 250,
            "📖 AYUDA",
            {
                fontSize: "48px",
                fill: "#000",
                fontFamily: "Arial",
                fontStyle: "bold",
                align: "center"
            }
        ).setOrigin(0.5).setDepth(102);

        // ✅ Sección: Objetivo
        this.add.text(
            this.cameras.main.width / 2,
            this.cameras.main.height / 2 - 190,
            "🎯 OBJETIVO",
            {
                fontSize: "32px",
                fill: "#000",
                fontFamily: "Arial",
                fontStyle: "bold"
            }
        ).setOrigin(0.5).setDepth(102);

        this.add.text(
            this.cameras.main.width / 2,
            this.cameras.main.height / 2 - 145,
            "Extrae todos los minerales del mapa para ganar.\nCuidado con las caídas, ya que perderás vida.",
            {
                fontSize: "24px",
                fill: "#333",
                fontFamily: "Arial",
                align: "center",
                wordWrap: { width: 600 }
            }
        ).setOrigin(0.5).setDepth(102);

        // ✅ Sección: Controles
        this.add.text(
            this.cameras.main.width / 2,
            this.cameras.main.height / 2 - 90,
            "🎮 CONTROLES",
            {
                fontSize: "32px",
                fill: "#000",
                fontFamily: "Arial",
                fontStyle: "bold"
            }
        ).setOrigin(0.5).setDepth(102);

        const controles = [
            "Flechas: Moverse",
            "Espacio: Colocar escaleras o entrar a la refinería y al arsenal",
            "Tecla M: Abrir mochila",
            "Tecla P: Pausar el juego"
        ];

        controles.forEach((texto, index) => {
            this.add.text(
                this.cameras.main.width / 2,
                this.cameras.main.height / 2 - 50 + index * 40,
                texto,
                {
                    fontSize: "24px",
                    fill: "#333",
                    fontFamily: "Arial"
                }
            ).setOrigin(0.5).setDepth(102);
        });

        // ✅ Sección: Tiendas
        this.add.text(
            this.cameras.main.width / 2,
            this.cameras.main.height / 2 + 130,
            "🏬 TIENDAS",
            {
                fontSize: "32px",
                fill: "#000",
                fontFamily: "Arial",
                fontStyle: "bold"
            }
        ).setOrigin(0.5).setDepth(102);

        const tiendas = [
            "🛠️ Arsenal: Comprar picos y escaleras",
            "💰 Refinería: Vender minerales por monedas"
        ];

        tiendas.forEach((texto, index) => {
            this.add.text(
                this.cameras.main.width / 2,
                this.cameras.main.height / 2 + 170 + index * 40,
                texto,
                {
                    fontSize: "24px",
                    fill: "#333",
                    fontFamily: "Arial"
                }
            ).setOrigin(0.5).setDepth(102);
        });

        // ✅ Cerrar con tecla "X"
        const closeButton = this.add.text(
            this.cameras.main.width / 2 + 570,
            this.cameras.main.height / 2 - 260,
            "❌",
            {
                fontSize: "28px",
                fill: "#ff0000",
                fontFamily: "Arial",
                fontStyle: "bold"
            }
        ).setOrigin(0.5).setDepth(103).setInteractive();

        closeButton.on("pointerdown", () => {
            // ✅ Restaurar controles al cerrar la ayuda
            const gameScene = this.scene.get('GameScene');
            if (gameScene) {
                this.scene.resume('GameScene'); // Reanudar el juego
                gameScene.input.keyboard.enabled = true; // Reactivar las teclas
            }

            this.scene.stop(); // Cerrar la escena de ayuda
        });
    }
}

class LogrosScene extends Phaser.Scene {
    constructor() {
        super({ key: 'LogrosScene' });
    }

    create() {
        // ✅ Obtener la escena del juego
        const gameScene = this.scene.get('GameScene');
        if (gameScene) {
            this.scene.pause('GameScene'); // Pausar el juego mientras la ayuda está abierta
            gameScene.input.keyboard.enabled = false; // Bloquear las teclas
        }

        // ✅ Fondo semitransparente para la pantalla de logros
        const overlay = this.add.rectangle(
            this.cameras.main.width / 2,
            this.cameras.main.height / 2,
            this.cameras.main.width,
            this.cameras.main.height,
            0x000000,
            0.7
        ).setDepth(100);

        // ✅ Borde de la ayuda
        const border = this.add.rectangle(
            this.cameras.main.width / 2,
            this.cameras.main.height / 2,
            this.cameras.main.width - 325,
            this.cameras.main.height - 100,
            0x5A3825
        ).setDepth(101).setStrokeStyle(4, 0x000000);

        // ✅ Panel de la ayuda
        const panel = this.add.rectangle(
            this.cameras.main.width / 2,
            this.cameras.main.height / 2,
            this.cameras.main.width - 350,
            this.cameras.main.height - 125,
            0xFFF0C9
        ).setDepth(101).setStrokeStyle(4, 0x000000);

        // ✅ Título "Logros"
        this.add.text(
            this.cameras.main.width / 2,
            this.cameras.main.height / 2 - 250,
            "🏆 LOGROS",
            {
                fontSize: "40px",
                fill: "#000",
                fontFamily: "Arial",
                fontStyle: "bold",
                align: "center"
            }
        ).setOrigin(0.5).setDepth(102);

        // Lista de logros (Ejemplo con 10 logros, 5 en cada columna)
        const logros = [
            { titulo: "Minero Nocturno 🌙", descripcion: "Juega exactamente a las 00:00", completado: false },
            { titulo: "Casi me mato 💀", descripcion: "Sobrevive a una caída y quédate con 1 de vida", completado: true },
            { titulo: "Oferta Fantasma 👻", descripcion: "Intenta vender un mineral que no tienes", completado: false },
            { titulo: "El Último Golpe 🔨", descripcion: "Pica el último mineral del mapa", completado: true },
            { titulo: "Regreso del Inframundo 🌋", descripcion: "Baja hasta la última capa y vuelve a la superficie", completado: false },
            { titulo: "Sin Salida 🚧", descripcion: "Quedarte sin escaleras y no poder salir", completado: true },
            { titulo: "Modo Zen 🧘‍♂️", descripcion: "Pasa 5 minutos sin picar ningún bloque", completado: false },
            { titulo: "Primer Destello ✨", descripcion: "Pica tu primer mineral raro", completado: true },
            { titulo: "Comerciante Mayorista 🏪", descripcion: "Vende más de 500 minerales en la refinería", completado: false },
            { titulo: "El Arquitecto Minero 🏗️", descripcion: "Coloca más de 250 escaleras en una partida", completado: true }
        ];

        // ✅ Mostrar los logros en dos columnas
        const startX = this.cameras.main.width / 2 - 500;
        const startY = this.cameras.main.height / 2 - 160;
        const columnSpacing = 600;
        const rowSpacing = 80;

        logros.forEach((logro, index) => {
            const col = index % 2;
            const row = Math.floor(index / 2);
            const x = startX + col * columnSpacing;
            const y = startY + row * rowSpacing;

            // Icono de logro (check o cruz)
            this.add.text(
                x - 30,
                y,
                logro.completado ? "✔" : "❌",
                {
                    fontSize: "30px",
                    fill: logro.completado ? "#28a745" : "#dc3545", // Verde para completado, rojo para no completado
                    fontFamily: "Arial",
                    fontStyle: "bold"
                }
            ).setOrigin(0.5).setDepth(102);

            // Título del logro
            this.add.text(
                x + 10,
                y,
                logro.titulo,
                {
                    fontSize: "24px",
                    fill: "#000",
                    fontFamily: "Arial",
                    fontStyle: "bold"
                }
            ).setOrigin(0, 0.5).setDepth(102);

            // Descripción del logro (oculta si no está completado)
            this.add.text(
                x + 10,
                y + 20,
                logro.completado ? logro.descripcion : "???",
                {
                    fontSize: "20px",
                    fill: "#444",
                    fontFamily: "Arial"
                }
            ).setOrigin(0, 0.5).setDepth(102);
        });

        // ✅ Cerrar con tecla "X"
        const closeButton = this.add.text(
            this.cameras.main.width / 2 + 570,
            this.cameras.main.height / 2 - 260,
            "❌",
            {
                fontSize: "28px",
                fill: "#ff0000",
                fontFamily: "Arial",
                fontStyle: "bold"
            }
        ).setOrigin(0.5).setDepth(103).setInteractive();

        closeButton.on("pointerdown", () => {
            // ✅ Restaurar controles al cerrar la logros
            const gameScene = this.scene.get('GameScene');
            if (gameScene) {
                this.scene.resume('GameScene'); // Reanudar el juego
                gameScene.input.keyboard.enabled = true; // Reactivar las teclas
            }

            this.scene.stop(); // Cerrar la escena de ayuda
        });
    }
}

class WarningScene extends Phaser.Scene {
    constructor() {
        super({ key: 'WarningScene' });
    }

    init(data) {
        this.mineral = data.mineral || "este mineral";
        this.pico = data.pico || "este pico";
    }

    create() {

        // ✅ Obtener la escena del juego
        const gameScene = this.scene.get('GameScene');
        if (gameScene) {
            // ✅ Pausar completamente la escena del juego
            this.scene.pause('GameScene');

            // ✅ Bloquear controles
            gameScene.input.keyboard.enabled = false;
            gameScene.input.enabled = false;
            gameScene.moving = false;

            // ✅ Detener cualquier tween (animación de movimiento)
            if (gameScene.currentTween) {
                gameScene.currentTween.stop();
                gameScene.currentTween = null;
            }

            // ✅ Asegurar que el personaje se detiene por completo
            gameScene.player.setVelocity(0, 0);
        }

        // ✅ Fondo semitransparente
        const overlay = this.add.rectangle(
            this.cameras.main.width / 2,
            this.cameras.main.height / 2,
            this.cameras.main.width,
            this.cameras.main.height,
            0x000000,
            0.5
        ).setDepth(100);

        // ✅ Cartel principal (fondo claro)
        const panel = this.add.rectangle(
            this.cameras.main.width / 2,
            this.cameras.main.height / 2,
            400,
            200,
            0xFFFFFF
        ).setDepth(101).setStrokeStyle(4, 0x000000);

        // ✅ Texto de advertencia
        const warningText = this.add.text(
            this.cameras.main.width / 2,
            this.cameras.main.height / 2,
            `No puedes picar ${this.mineral} con un pico de ${this.pico}`,
            {
                fontSize: "22px",
                fill: "#000",
                fontFamily: "Arial",
                align: "center",
                wordWrap: { width: 350 }
            }
        ).setOrigin(0.5).setDepth(102);

        // ✅ Botón de cerrar ("X")
        const closeButton = this.add.text(
            this.cameras.main.width / 2 + 180,
            this.cameras.main.height / 2 - 80,
            "❌",
            {
                fontSize: "28px",
                fill: "#ff0000",
                fontFamily: "Arial",
                fontStyle: "bold"
            }
        ).setOrigin(0.5).setDepth(103).setInteractive();

        closeButton.on("pointerdown", () => {
            // ✅ Restaurar controles y reanudar la escena del juego
            const gameScene = this.scene.get('GameScene');
            if (gameScene) {
                this.scene.resume('GameScene'); // ✅ Reanudar el juego
                gameScene.input.keyboard.enabled = true;
                gameScene.input.enabled = true;
                gameScene.moving = false;
            }

            this.scene.stop(); // Cerrar la escena de advertencia
        });

        // Evitar que se interactúe con el juego mientras el mensaje está abierto
        this.input.keyboard.enabled = false;

        // Restaurar controles al cerrar
        this.events.on('shutdown', () => {
            const gameScene = this.scene.get('GameScene');
            if (gameScene) {
                gameScene.input.keyboard.enabled = true;
            }
        });
    }
}

class ArsenalMenuScene extends Phaser.Scene {
    constructor() {
        super({ key: 'ArsenalMenuScene' });
    }

    create() {
        console.log("🎯 ArsenalMenuScene iniciada...");

        // 🔹 Fondo semitransparente que cubre toda la pantalla
        const menuBackground = this.add.rectangle(
            this.cameras.main.width / 2,
            this.cameras.main.height / 2,
            this.cameras.main.width,
            this.cameras.main.height,
            0x000000,
            0.8 // Opacidad del fondo
        ).setOrigin(0.5);

        // 🔹 Dimensiones del menú
        const borde = 38; // 1 cm en píxeles
        const menuAncho = this.cameras.main.width - 2 * borde;
        const menuAlto = this.cameras.main.height - 2 * borde;

        // 🔹 Crear contenedor del menú
        this.menuContainer = this.add.container(
            this.cameras.main.scrollX + this.cameras.main.width / 2,
            this.cameras.main.scrollY + this.cameras.main.height / 2
        );

        // 🔹 Borde del menú (marrón oscuro)
        this.menuBorde = this.add.rectangle(0, 0, menuAncho, menuAlto, 0x5A3825) // Marrón oscuro
            .setOrigin(0.5)
            .setDepth(20);

        // 🔹 Fondo del menú (marrón claro)
        this.menuFondo = this.add.rectangle(0, 0, menuAncho - 10, menuAlto - 10, 0xFFF0C9) // Marrón claro
            .setOrigin(0.5)
            .setDepth(21);

        // 🔹 Título del menú
        this.menuTitulo = this.add.text(
            0, -menuAlto / 2 + 40, // Posición relativa dentro del menú
            "Arsenal Minero",
            { fontSize: "48px", fill: "#000000", fontFamily: "Arial", fontStyle: "bold" }
        ).setOrigin(0.5).setDepth(22);

        // 🔹 Agregar elementos al contenedor
        this.menuContainer.add([this.menuBorde, this.menuFondo, this.menuTitulo]);

        // 🔹 Hacer que el menú siga la cámara
        this.events.on("update", () => {
            this.menuContainer.setPosition(
                this.cameras.main.scrollX + this.cameras.main.width / 2,
                this.cameras.main.scrollY + this.cameras.main.height / 2
            );
        });

        // 🔹 Definir las herramientas con sus imágenes y valores
        const herramientas = [
            { nombre: "escalera", imagen: "ladder", valor: 2 },
            { nombre: "pico_madera", imagen: "pico_madera", valor: 5 },
            { nombre: "pico_piedra", imagen: "pico_piedra", valor: 10 },
            { nombre: "pico_hierro", imagen: "pico_hierro", valor: 25 },
            { nombre: "pico_oro", imagen: "pico_oro", valor: 50 }
        ];

        // 🔹 Crear contenedor para los botones de compra
        this.menuCompra = this.add.container(0, 0).setDepth(23);
        this.menuContainer.add(this.menuCompra);

        const columnas = 5;  // 5 columnas
        const filas = 1;     // 1 fila
        const espacioX = menuAncho / columnas; // Espacio horizontal
        const espacioY = menuAlto / filas;   // Espacio vertical

        for (let i = 0; i < herramientas.length; i++) {
            const columna = i % columnas;
            const fila = Math.floor(i / columnas);

            const xPos = -menuAncho / 2 + espacioX * columna + espacioX / 2;
            const yPos = -menuAlto / 2.2 + espacioY * fila + espacioY / 2;

            // 🔹 Crear botón con el icono del ítem
            const boton = this.add.image(xPos, yPos, herramientas[i].imagen)
                .setOrigin(0.5)
                .setDisplaySize(espacioX * 0.55, espacioY / 2 * 0.55) // Ajusta al tamaño de la cuadrícula
                .setInteractive({ useHandCursor: true })
                .on('pointerdown', () => {
                    this.comprarItem(herramientas[i].nombre, herramientas[i].valor);
                });

            // 🔹 Texto con el precio del ítem
            const textoNumero = this.add.text(xPos - 2, yPos + 92 + 25, `${herramientas[i].valor}`, {
                fontSize: "24px",
                fill: "#000000",
                fontStyle: "bold",
                fontFamily: "Arial"
            }).setOrigin(1, 0.5).setDepth(24);

            // 🔹 Icono de moneda después del número
            const monedaIcono = this.add.image(xPos + 2, yPos + 90 + 25, "icono_moneda")
                .setOrigin(0, 0.5)
                .setDisplaySize(35, 35) // Ajustar tamaño del icono de moneda
                .setDepth(24);

            this.menuCompra.add(boton);
            this.menuCompra.add(textoNumero);
            this.menuCompra.add(monedaIcono);
        }

        // 🔹 Obtener la escena del juego para acceder a las monedas actuales
        const gameScene = this.scene.get('GameScene');

        // 🔹 Contador de monedas
        this.contadorMonedas = this.add.text(
            menuAncho / 2 - 100, // Posición a la derecha
            -menuAlto / 2 + 40, // A la misma altura que el título
            `${gameScene.monedas}`,
            { fontSize: "32px", fill: "#000000", fontFamily: "Arial", fontStyle: "bold" }
        ).setOrigin(1, 0.5).setDepth(22);

        // 🔹 Icono de moneda
        this.monedaIcono = this.add.image(
            menuAncho / 2 - 90, // Justo a la derecha del contador
            -menuAlto / 2 + 40,
            "icono_moneda"
        ).setOrigin(0, 0.5).setDisplaySize(35, 35).setDepth(22);

        // 🔹 Agregar los elementos al contenedor del menú
        this.menuContainer.add([this.contadorMonedas, this.monedaIcono]);

        // 🔹 Detectar tecla ESPACIO para cerrar el menú
        this.input.keyboard.on("keydown-SPACE", () => {
            console.log("🚪 Cerrando ArsenalMenuScene...");
            this.scene.stop(); // 🔹 Cerrar la escena
            this.scene.resume('GameScene'); // 🔹 Reanudar GameScene al cerrar el menú
        });
    }

    comprarItem(nombre, valor) {
        const gameScene = this.scene.get('GameScene');

        if (gameScene.monedas >= valor) {
            gameScene.monedas -= valor;

            if (nombre === "escalera") {
                gameScene.cantidadEscaleras++;
                gameScene.contadorEscaleras.setText(gameScene.cantidadEscaleras);
            } else if (nombre.includes("pico")) {
                gameScene.picoActual = nombre;
                gameScene.iconoPico.setTexture(gameScene.picoActual);
                gameScene.durabilidadPico = gameScene.durabilidadesPicos[gameScene.picoActual];
                gameScene.barraDurabilidad.setScale(1, 1);
            }

            console.log(`🟢 Compraste ${nombre}. Te quedan ${gameScene.monedas} monedas.`);

            // 🔹 Actualizar el contador de monedas en el menú
            this.contadorMonedas.setText(gameScene.monedas);
        } else {
            console.log(`❌ No tienes suficientes monedas para comprar ${nombre}.`);
        }
    }
}

class RefineriaMenuScene extends Phaser.Scene {
    constructor() {
        super({ key: 'RefineriaMenuScene' });
    }

    create() {
        console.log("🔹 RefineriaMenuScene iniciada...");

        // 🔹 Fondo semitransparente que cubre toda la pantalla
        const menuBackground = this.add.rectangle(
            this.cameras.main.width / 2,
            this.cameras.main.height / 2,
            this.cameras.main.width,
            this.cameras.main.height,
            0x000000,
            0.8 // Opacidad del fondo
        ).setOrigin(0.5);

        // 🔹 Dimensiones del menú
        const borde = 38;
        const menuAncho = this.cameras.main.width - 2 * borde;
        const menuAlto = this.cameras.main.height - 2 * borde;

        // 🔹 Crear contenedor del menú
        this.menuContainer = this.add.container(
            this.cameras.main.scrollX + this.cameras.main.width / 2,
            this.cameras.main.scrollY + this.cameras.main.height / 2
        );

        // 🔹 Borde del menú (marrón oscuro)
        this.menuBorde = this.add.rectangle(0, 0, menuAncho, menuAlto, 0x5A3825) // Marrón oscuro
            .setOrigin(0.5)
            .setDepth(20);

        // 🔹 Fondo del menú (marrón claro)
        this.menuFondo = this.add.rectangle(0, 0, menuAncho - 10, menuAlto - 10, 0xFFF0C9) // Marrón claro
            .setOrigin(0.5)
            .setDepth(21);

        // 🔹 Título del menú
        this.menuTitulo = this.add.text(
            0, -menuAlto / 2 + 40,
            "Refinería del minero",
            { fontSize: "48px", fill: "#000000", fontFamily: "Arial", fontStyle: "bold" }
        ).setOrigin(0.5).setDepth(22);

        // 🔹 Agregar elementos al contenedor
        this.menuContainer.add([this.menuBorde, this.menuFondo, this.menuTitulo]);

        // 🔹 Hacer que el menú siga la cámara
        this.events.on("update", () => {
            this.menuContainer.setPosition(
                this.cameras.main.scrollX + this.cameras.main.width / 2,
                this.cameras.main.scrollY + this.cameras.main.height / 2
            );
        });

        // 🔹 Definir los minerales con sus valores de refinado
        const minerales = [
            { nombre: "carbon", imagen: "icono_carbon", valor: 1 },
            { nombre: "cobre", imagen: "icono_cobre", valor: 2 },
            { nombre: "hierro", imagen: "icono_hierro", valor: 5 },
            { nombre: "plata", imagen: "icono_plata", valor: 10 },
            { nombre: "oro", imagen: "icono_oro", valor: 25 },
            { nombre: "rubi", imagen: "icono_rubi", valor: 35 },
            { nombre: "esmeralda", imagen: "icono_esmeralda", valor: 50 },
            { nombre: "diamante", imagen: "icono_diamante", valor: 75 }
        ];

        // 🔹 Crear contenedor para los botones de refinado
        this.menuRefinado = this.add.container(0, 0).setDepth(23);
        this.menuContainer.add(this.menuRefinado);

        const columnas = 4;  // 4 columnas
        const filas = 2;     // 2 filas
        const espacioX = menuAncho / columnas; // Espacio horizontal
        const espacioY = menuAlto / filas;   // Espacio vertical

        for (let i = 0; i < minerales.length; i++) {
            const columna = i % columnas;
            const fila = Math.floor(i / columnas);

            const xPos = -menuAncho / 2 + espacioX * columna + espacioX / 2;
            const yPos = -menuAlto / 2.2 + espacioY * fila + espacioY / 2;

            // 🔹 Crear botón con el icono del mineral
            const boton = this.add.image(xPos, yPos, minerales[i].imagen)
                .setOrigin(0.5)
                .setDisplaySize(espacioX * 0.55, espacioY * 0.55)
                .setInteractive({ useHandCursor: true })
                .on('pointerdown', () => {
                    this.refinarMineral(minerales[i].nombre, minerales[i].valor);
                });

            // 🔹 Texto con el valor de refinado
            const textoNumero = this.add.text(xPos - 2, yPos + 92, `${minerales[i].valor}`, {
                fontSize: "24px",
                fill: "#000000",
                fontStyle: "bold",
                fontFamily: "Arial"
            }).setOrigin(1, 0.5).setDepth(24);

            // 🔹 Icono de moneda
            const monedaIcono = this.add.image(xPos + 2, yPos + 90, "icono_moneda")
                .setOrigin(0, 0.5)
                .setDisplaySize(35, 35)
                .setDepth(24);

            this.menuRefinado.add(boton);
            this.menuRefinado.add(textoNumero);
            this.menuRefinado.add(monedaIcono);
        }

        // 🔹 Obtener la escena del juego para acceder a las monedas actuales
        const gameScene = this.scene.get('GameScene');

        // 🔹 Contador de monedas
        this.contadorMonedas = this.add.text(
            menuAncho / 2 - 100, // Posición a la derecha
            -menuAlto / 2 + 40, // A la misma altura que el título
            `${gameScene.monedas}`,
            { fontSize: "32px", fill: "#000000", fontFamily: "Arial", fontStyle: "bold" }
        ).setOrigin(1, 0.5).setDepth(22);

        // 🔹 Icono de moneda
        this.monedaIcono = this.add.image(
            menuAncho / 2 - 90, // Justo a la derecha del contador
            -menuAlto / 2 + 40,
            "icono_moneda"
        ).setOrigin(0, 0.5).setDisplaySize(35, 35).setDepth(22);

        // 🔹 Agregar los elementos al contenedor del menú
        this.menuContainer.add([this.contadorMonedas, this.monedaIcono]);

        // 🔹 Detectar tecla ESPACIO para cerrar el menú
        this.input.keyboard.on("keydown-SPACE", () => {
            console.log("🚪 Cerrando RefineriaMenuScene...");
            this.scene.stop();
            this.scene.resume('GameScene'); // 🔹 Reanudar GameScene al cerrar el menú
        });
    }

    refinarMineral(nombre, valor) {
        const gameScene = this.scene.get('GameScene');

        if (gameScene[nombre + "Count"] > 0) {
            gameScene[nombre + "Count"]--; // Restar un mineral
            gameScene.monedas += valor; // Sumar monedas

            console.log(`🟢 Refinaste 1 ${nombre}. Ahora tienes ${gameScene.monedas} monedas.`);

            // 🔹 Actualizar el contador de monedas en el menú
            this.contadorMonedas.setText(gameScene.monedas.toString());
        } else {
            console.log(`❌ No tienes suficiente ${nombre} para refinar.`);
        }
    }
}

class PauseMenu extends Phaser.Scene {
    constructor() {
        super({ key: 'PauseMenu' });
    }

    create() {
        // Fondo semi-transparente
        this.add.rectangle(this.cameras.main.width / 2, this.cameras.main.height / 2,
            this.cameras.main.width * 0.6, this.cameras.main.height * 0.4,
            0x000000, 0.8).setOrigin(0.5);

        // Texto de "PAUSA"
        this.add.text(this.cameras.main.width / 2, this.cameras.main.height / 2 - 50,
            "PAUSA", { fontSize: "32px", fill: "#fff", fontStyle: "bold" })
            .setOrigin(0.5);

        // Botón de salir al menú principal
        this.exitButton = this.add.text(
            this.cameras.main.width / 2, this.cameras.main.height / 2 + 50,
            "Salir al Menú",
            { fontSize: "24px", fill: "#fff", backgroundColor: "#dc3545", padding: 10 }
        )
            .setOrigin(0.5)
            .setInteractive()
            .on("pointerdown", () => {
                this.scene.stop('GameScene'); // Detener la partida
                this.scene.stop('PauseMenu'); // Cerrar el menú de pausa
                this.scene.start('MenuScene'); // Volver al menú principal
            });

        // 🔹 Mostrar u ocultar el botón de guardado según el estado del usuario
        if (window.firebaseAuth.currentUser) {
            // Botón de guardar partida (si el jugador está logueado)
            this.saveButton = this.add.text(
                this.cameras.main.width / 2, this.cameras.main.height / 2,
                "Guardar Partida",
                { fontSize: "24px", fill: "#fff", backgroundColor: "#28a745", padding: 10 }
            )
                .setOrigin(0.5)
                .setInteractive()
                .on("pointerdown", () => {
                    const gameScene = this.scene.get('GameScene');
                    if (gameScene.modoInicio === "sobreescribir") {
                        const confirmOverride = window.confirm("Esto sobreescribirá tu partida anterior. ¿Quieres continuar?");
                        if (confirmOverride) {
                            guardarPartida();
                        }
                    } else {
                        guardarPartida();
                    }
                });
        }

        // 🔹 Detectar tecla P para cerrar el menú de pausa y reanudar el juego
        this.input.keyboard.on("keydown-P", () => {
            this.scene.stop();  // Cerrar el menú de pausa
            this.scene.resume("GameScene"); // Reanudar el juego
        });
    }
}

class VictoryScene extends Phaser.Scene {
    constructor() {
        super({ key: 'VictoryScene' });
    }

    create() {
        console.log("🏆 Escena de victoria iniciada...");

        // ✅ Fondo semitransparente
        const overlay = this.add.rectangle(
            this.cameras.main.width / 2,
            this.cameras.main.height / 2,
            this.cameras.main.width,
            this.cameras.main.height,
            0x000000,
            0.7
        ).setDepth(100);

        // ✅ Texto de felicitación
        this.add.text(
            this.cameras.main.width / 2,
            this.cameras.main.height / 2 - 75,
            "🎉 ¡Felicidades!\nHas completado Miner Madness",
            {
                fontSize: "48px",
                fill: "#ffffff",
                fontStyle: "bold",
                fontFamily: "Arial",
                align: "center"
            }
        ).setOrigin(0.5).setDepth(101);

        // ✅ Botón "Continuar Partida"
        const botonContinuar = this.add.text(
            this.cameras.main.width / 2,
            this.cameras.main.height / 2 + 50,
            "Continuar Partida",
            {
                fontSize: "32px",
                fill: "#ffffff",
                backgroundColor: "#28a745",
                padding: 10
            }
        ).setOrigin(0.5).setDepth(102).setInteractive();

        // ✅ Botón "Menú Inicial"
        const botonMenu = this.add.text(
            this.cameras.main.width / 2,
            this.cameras.main.height / 2 + 120,
            "Menú Inicial",
            {
                fontSize: "32px",
                fill: "#ffffff",
                backgroundColor: "#dc3545",
                padding: 10
            }
        ).setOrigin(0.5).setDepth(102).setInteractive();

        // ✅ Acciones de los botones
        botonContinuar.on("pointerdown", () => {
            console.log("🎮 Continuando la partida...");
            this.scene.stop(); // Detener la escena de victoria
            this.scene.resume('GameScene'); // Reanudar el juego
        });

        botonMenu.on("pointerdown", () => {
            console.log("📜 Volviendo al menú principal...");
            this.scene.stop('GameScene'); // Detener el juego
            this.scene.start('MenuScene'); // Volver al menú principal
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
    scene: [MenuScene, GameScene, PauseMenu, ArsenalMenuScene, RefineriaMenuScene, VictoryScene, WarningScene, MochilaScene, HelpScene, LogrosScene] // Incluir escenas
};

const game = new Phaser.Game(config);

// Redimensionar el lienzo cuando se cambie el tamaño de la ventana
window.addEventListener('resize', () => {
    game.scale.resize(window.innerWidth, window.innerHeight);
});