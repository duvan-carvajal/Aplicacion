
        juegoIniciado = false;
        const musiquita = document.getElementById("bgMusic");
        const gamearea = document.getElementById('gamearea');
        const soul = document.getElementById("soul");
        const paso = 5;
        let velocidadbalah = 15;
        let velocidadbalav = 11;
        let hp = 20;
        let y = 200;
        let x = 200;
        let ataquesRealizados = 0;
        const maxAtaques = 20;
        let turnoEnemigo = true;
        let enemyhp = 100;
        let intervaloBalas;

        const minX = 0;
        const minY = 0;
        const maxX = gamearea.clientWidth - soul.offsetWidth;
        const maxY = gamearea.clientHeight - soul.offsetHeight;
        const cooldownTiempo = 1000;
        let ultimoDaño = 0;
        const r = Math.random();
            tipoAtaque = r < 0.25 ? "vertical" : 
                         r < 0.5 ? "horizontal" : 
                         r < 0.75 ? "otrolado" : "abajo";

        const bullets = [];
        const keysPressed = {};
        function iniciarJuego() {
        if (juegoIniciado) return;
        juegoIniciado = true;
         mover();
          intervaloBalas = setInterval(crearBala, 500); 
        }

        function isColliding(el1, el2, padding = 0){
            const r1 = el1.getBoundingClientRect();
            const r2 = el2.getBoundingClientRect();
            const r2Shrunk = {
            top: r2.top + padding,
            right: r2.right - padding,
            bottom: r2.bottom - padding,
            left: r2.left + padding
        };
            return !(r1.right < r2Shrunk.left || r1.left > r2Shrunk.right || r1.bottom < r2Shrunk.top || r1.top > r2Shrunk.bottom);
        }

        function terminarTurnoEnemigo(){
            if (hp <= 0){
                musiquita.pause();
                return;
            }
            turnoEnemigo = false;
            clearInterval(intervaloBalas);
            bullets.forEach(b => {
                if (b.element.parentNode) {
                    b.element.parentNode.removeChild(b.element);
                }
            });
            bullets.length = 0;

            console.log("es tu turno we");
            

            const ataque = document.createElement('img');
            ataque.src = "slash.gif";
            ataque.style.position = "absolute";
            ataque.style.left = "50%";
            ataque.style.width = "100px";
            ataque.style.top = "calc(300px - 100px)"
            const attacked = new Audio("soundslash.mp3");
            attacked.play();
            attacked.volume = 0.3;
            ataque.style.transform = "translateX(-50%)";
            ataque.style.zIndex = "2000"
            ataque.width = 150;
            document.body.appendChild(ataque);
            setTimeout(() => {
                ataque.remove();

                const quince = document.createElement('img');
            quince.src = "quince.png";
            quince.style.position = "absolute";
            quince.style.left = "56%";
            quince.style.top = "calc(300px - 150px)";
            quince.style.transform = "translateX(-50%)";
            quince.style.width = "150px";
            quince.style.zIndex = "1500";
            document.body.appendChild(quince);

            setTimeout(() => {
            quince.remove();
        }, 1000); 
                enemyhp -=15;
                

                document.getElementById("hpDisplayEnemigo").textContent = "ENEMY HP: " + enemyhp;
                if (enemyhp <= 0) {
                    musiquita.pause();
                    const pibito = document.getElementById("pibito");
                    pibito.style.display = "none"; 
                    console.log("lol lo mate xd");
                    const boom = document.createElement('img');
                    boom.src = "boom.png";
                    boom.style.position = "absolute";
                    boom.style.left = "50%";
                    boom.style.width = "500px";
                    boom.style.top = "calc(300px - 100px)";
                    boom.style.transform = "translateX(-50%)";
                    boom.style.zIndex = "2000"
                   boom.width = 150;
                   document.body.appendChild(boom);
            setTimeout(() => {
            boom.remove();
        }, 1000);
                    return;
                }
                setTimeout(iniciarTurnoEnemigo, 1000);
            }, 1000);
        }

        function iniciarTurnoEnemigo(){
            turnoEnemigo = true;
            ataquesRealizados = 0;
            velocidadbalah += 1.5;
            velocidadbalav += 1.5;
            
            // --- CORREGIDO: operador ternario anidado ---
            const r = Math.random();
            tipoAtaque = r < 0.25 ? "vertical" : 
                         r < 0.5 ? "horizontal" : 
                         r < 0.75 ? "otrolado" : "abajo";

            intervaloBalas = setInterval(() => crearBala(tipoAtaque), 500);
        }

        function crearBala(){
            if (!turnoEnemigo) return;
            const bullet = document.createElement('img');
            bullet.src = "bullet.png";
            bullet.classList.add('bullet');
            bullet.style.position = "absolute";
            let pos;
            
            gamearea.appendChild(bullet); 

            if (tipoAtaque === "vertical"){
                bullet.style.top = (gamearea.clientHeight + 20) + "px";
                bullet.style.left = x + 'px';
                bullet.style.transform = "rotate(130deg)";
                pos = { 
                    x: x, 
                    y: gamearea.clientHeight + 20, 
                    element: bullet, 
                    speed: velocidadbalav, 
                    direccion: "vertical" };
            
            } else if (tipoAtaque === "horizontal") {
                bullet.style.left = -100 + "px";
                bullet.style.top = y + "px";
                bullet.style.transform = "rotate(220deg)";
                pos = { 
                    x: -100, 
                    y: y + "px", 
                    element: bullet, 
                    speed: velocidadbalah, 
                    direccion: "horizontal" 
                };
            
            } else if (tipoAtaque === "otrolado") {
               
                bullet.style.left = (gamearea.clientWidth + 100) + "px"; 
                bullet.style.top = y + "px";
                bullet.style.transform = "rotate(40deg)";
                pos = { 
                    x: gamearea.clientWidth + 100, 
                    y: y, 
                    element: bullet, 
                    speed: velocidadbalah,
                     direccion: "otrolado" };
            
            } else if (tipoAtaque === "abajo") {
                bullet.style.top = -150 + "px";
                bullet.style.left = x + 'px';
                bullet.style.transform = "rotate(310deg)";
                pos = { 
                    x: x, 
                    y: -20, 
                    element: bullet, 
                    speed: velocidadbalav, 
                    direccion: "abajo" 
                };
            }
    
            bullets.push(pos);
            ataquesRealizados++;
            if (ataquesRealizados >= maxAtaques){
                terminarTurnoEnemigo();
            }
        }

        function mover (){
            let dx = 0, dy = 0;
            if (keysPressed["ArrowUp"]) dy -= 1;
            if (keysPressed["ArrowDown"]) dy += 1;
            if (keysPressed["ArrowLeft"]) dx -= 1;
            if (keysPressed["ArrowRight"]) dx += 1;

            if (dx!==0 || dy !==0){
                const length = Math.sqrt(dx * dx + dy * dy);
                dx = (dx / length) * paso;
                dy = (dy / length) * paso;

                x += dx; y += dy;
                x = Math.min(maxX, Math.max(minX, x));
                y = Math.min(maxY, Math.max(minY, y));
                soul.style.top = y + "px";
                soul.style.left = x + "px";
            }

            for (let i = bullets.length - 1; i >= 0; i--){
                const b = bullets[i];
                if (b.direccion === "vertical"){
                    b.y -= b.speed;
                    b.element.style.top = b.y + "px";
                } else if (b.direccion === "horizontal"){
                    b.x += b.speed;
                    b.element.style.left = b.x + "px";
                } else if (b.direccion === "otrolado"){
                    b.x -= b.speed;
                    b.element.style.left = b.x + "px";
                } else if (b.direccion === "abajo"){
                    b.y += b.speed;
                    b.element.style.top = b.y + "px";
                }

                if (isColliding(soul, b.element, 8)) {
                    const ahora = Date.now();
                    if (ahora - ultimoDaño > cooldownTiempo) {
                        hp -= 1;
                        ultimoDaño = ahora;
                        console.log(`HP: ${hp} / 20`);
                        const sonido = new Audio("hit.mp3");
                        sonido.play();
                        sonido.volume = 0.3;
                        document.getElementById("hpDisplay").textContent = "HP: " + hp;
                    }
                    gamearea.removeChild(b.element);
                    bullets.splice(i, 1);
                    continue;
                }
                if (b.y < -20 || b.y > gamearea.clientHeight + 100 || b.x < -100 || b.x > gamearea.clientWidth + 100) {
                    gamearea.removeChild(b.element);
                    bullets.splice(i, 1);
                    continue;
                }
            }

            if (hp <= 0) {
                soul.style.display = "none";
                return;
            }
            requestAnimationFrame(mover);
        }

        document.addEventListener("keydown", (e) =>{
            keysPressed[e.key] = true;
            if (!juegoIniciado) {
            iniciarJuego();
    }
            if (musiquita.paused) {
                musiquita.volume = 0.5; 
                musiquita.play();
            }
        });

        document.addEventListener("keyup", (e) =>{
            keysPressed[e.key] = false;
        });

