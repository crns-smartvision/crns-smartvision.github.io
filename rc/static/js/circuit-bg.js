(() => {
    const canvases = [
        document.getElementById('circuitCanvasLeft'),
        document.getElementById('circuitCanvasRight'),
    ].filter(Boolean);

    if (canvases.length === 0) return;

    const COLORS = {
        bgInner: '#ffffff',
        bgOuter: '#ffffff',
        node: '#6a6a6a',
        tiles: [
            'rgba(244, 130, 60, 0.75)',
            'rgba(80, 150, 220, 0.70)',
            'rgba(240, 200, 60, 0.75)',
            'rgba(220, 100, 160, 0.45)',
        ]
    };

    function createCircuitInstance(canvas) {
        const ctx = canvas.getContext('2d');
        const state = {
            width: 1,
            height: 1,
            particles: [],
            particleCount: 40,
            linkDistance: 160,
        };

        class Node {
            constructor() {
                this.reset(true);
            }

            reset(randomizePosition) {
                if (randomizePosition) {
                    this.x = Math.random() * state.width;
                    this.y = Math.random() * state.height;
                }
                this.speedX = (Math.random() - 0.5) * 0.3;
                this.speedY = (Math.random() - 0.5) * 0.3;
                this.size = Math.random() * 2 + 1;
                this.isSquare = Math.random() > 0.82;
                this.tileColor = COLORS.tiles[Math.floor(Math.random() * COLORS.tiles.length)];
                this.hasRing = !this.isSquare && Math.random() > 0.7;
            }

            update() {
                this.x += this.speedX;
                this.y += this.speedY;

                if (this.x > state.width) this.x = 0;
                if (this.x < 0) this.x = state.width;
                if (this.y > state.height) this.y = 0;
                if (this.y < 0) this.y = state.height;
            }

            draw() {
                if (this.isSquare) {
                    ctx.fillStyle = this.tileColor;
                    ctx.fillRect(this.x - 5, this.y - 5, 11, 11);
                    ctx.strokeStyle = 'rgba(100,100,100,0.25)';
                    ctx.lineWidth = 0.8;
                    ctx.strokeRect(this.x - 5, this.y - 5, 11, 11);
                } else {
                    ctx.fillStyle = COLORS.node;
                    ctx.beginPath();
                    ctx.arc(this.x, this.y, this.size, 0, Math.PI * 2);
                    ctx.fill();

                    if (this.hasRing) {
                        ctx.strokeStyle = COLORS.node;
                        ctx.lineWidth = 0.5;
                        ctx.beginPath();
                        ctx.arc(this.x, this.y, this.size + 5, 0, Math.PI * 2);
                        ctx.stroke();
                    }
                }
            }
        }

        function resize() {
            const dpr = window.devicePixelRatio || 1;
            const cssWidth = Math.max(1, Math.floor(canvas.clientWidth));
            const cssHeight = Math.max(1, Math.floor(canvas.clientHeight));

            state.width = cssWidth;
            state.height = cssHeight;

            canvas.width = Math.floor(cssWidth * dpr);
            canvas.height = Math.floor(cssHeight * dpr);
            ctx.setTransform(dpr, 0, 0, dpr, 0, 0);

            const area = cssWidth * cssHeight;
            state.particleCount = Math.max(18, Math.min(70, Math.round(area / 22000)));
            state.linkDistance = Math.max(120, Math.min(200, Math.round(Math.min(cssWidth, cssHeight) * 0.33)));

            state.particles = [];
            for (let i = 0; i < state.particleCount; i++) {
                state.particles.push(new Node());
            }
        }

        function drawBackground() {
            const gradient = ctx.createRadialGradient(
                state.width / 2, state.height / 2, 0,
                state.width / 2, state.height / 2, Math.max(state.width, state.height) / 1.2
            );
            gradient.addColorStop(0, COLORS.bgInner);
            gradient.addColorStop(1, COLORS.bgOuter);
            ctx.fillStyle = gradient;
            ctx.fillRect(0, 0, state.width, state.height);
        }

        function drawCircuitLines() {
            for (let i = 0; i < state.particles.length; i++) {
                for (let j = i + 1; j < state.particles.length; j++) {
                    const dx = state.particles[i].x - state.particles[j].x;
                    const dy = state.particles[i].y - state.particles[j].y;
                    const distance = Math.sqrt(dx * dx + dy * dy);

                    if (distance < state.linkDistance) {
                        ctx.beginPath();
                        ctx.strokeStyle = `rgba(120,120,120,${0.2 * (1 - distance / state.linkDistance)})`;
                        ctx.lineWidth = 0.8;
                        ctx.moveTo(state.particles[i].x, state.particles[i].y);
                        ctx.lineTo(state.particles[i].x, state.particles[j].y);
                        ctx.lineTo(state.particles[j].x, state.particles[j].y);
                        ctx.stroke();
                    }
                }
            }
        }

        function tick() {
            drawBackground();
            drawCircuitLines();
            state.particles.forEach(p => {
                p.update();
                p.draw();
            });
        }

        return { resize, tick };
    }

    const instances = canvases.map(createCircuitInstance);

    function onResize() {
        instances.forEach(i => i.resize());
    }

    window.addEventListener('resize', onResize, { passive: true });
    onResize();

    function animate() {
        instances.forEach(i => i.tick());
        requestAnimationFrame(animate);
    }

    animate();
})();
