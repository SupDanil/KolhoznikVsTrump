import Phaser from "phaser";

class GameScene extends Phaser.Scene {
    private player!: Phaser.GameObjects.Sprite;
    private cursors!: Phaser.Types.Input.Keyboard.CursorKeys;
    private leftButton!: Phaser.GameObjects.Text;
    private rightButton!: Phaser.GameObjects.Text;
    private fallingObjects!: Phaser.GameObjects.Group;
    private timerText!: Phaser.GameObjects.Text;
    private restartButton!: Phaser.GameObjects.Text;
    private nextLevelButton!: Phaser.GameObjects.Text;
    private levelText!: Phaser.GameObjects.Text;
    private timeSurvived: number = 0;
    private gameOver: boolean = false;
    private level: number = 1;
    private enemySpeed: number = 5;
    private timeEvent!: Phaser.Time.TimerEvent;
    private spawnEvent!: Phaser.Time.TimerEvent;
    private nextLevelEvent!: Phaser.Time.TimerEvent;
    private fightButton!: Phaser.GameObjects.Text; // Добавляем кнопку FIGHT!!!

    constructor() {
        super('gameScene');
    }

    preload(): void {
        this.load.image('background', 'assets/background.png');
        this.load.image('player', 'assets/player.png');
        this.load.image('enemy', 'assets/enemy.png');
    }

    create(): void {
        const width = this.cameras.main.width;
        const height = this.cameras.main.height;
        this.fallingObjects = this.add.group();

        // Фон
        const background = this.add.image(0, 0, 'background').setOrigin(0, 0);
        background.setDisplaySize(width, height);

        // Кнопка для начала игры
        this.fightButton = this.add.text(width / 2, height / 2, 'FIGHT!!!', {
            fontSize: '7vw',
        }).setOrigin(0.5, 0.5);

        this.fightButton.setInteractive().on('pointerdown', () => {
            this.startGame();
        });

        // Таймер
        this.timerText = this.add.text(16, 16, 'Time: 0', { fontSize: '5vw' }).setOrigin(0);

        // Уровень
        this.levelText = this.add.text(16, height - 50, `Level: ${this.level}`, {
            fontSize: '5vw',
        }).setOrigin(0, 0.3);
    }

    update(): void {
        if (this.gameOver) {
            return;
        }

        // Проверяем и обновляем состояние падающих объектов
        if (this.fallingObjects.children.size > 0) {
            this.fallingObjects.children.iterate((child) => {
                const spriteChild = child as Phaser.GameObjects.Sprite;
                spriteChild.y += this.enemySpeed;
                if (spriteChild.y > this.cameras.main.height) {
                    spriteChild.destroy();
                    return false;
                }
                if (spriteChild.getBounds().contains(this.player.x, this.player.y)) {
                    this.gameOver = true;
                    this.timerText.setText(`Game Over! Time: ${this.timeSurvived} seconds`);
                    this.restartButton.setVisible(true);
                    this.spawnEvent.paused = true;
                    return false;
                }
                return true;
            });
        }

        // Обработка ввода для перемещения игрока
        if (this.cursors && this.cursors.left.isDown) {
            this.movePlayerLeft();
        }
        if (this.cursors && this.cursors.right.isDown) {
            this.movePlayerRight();
        }
    }

    private startGame(): void {
        this.fightButton.setVisible(false); // Прячем кнопку FIGHT!!!

        // Игрок
        const width = this.cameras.main.width;
        const height = this.cameras.main.height;
        this.player = this.add.sprite(width / 2, height - 50, 'player');
        this.player.setOrigin(0.5, 0.5);

        // Виртуальные кнопки для мобильных устройств
        this.createMobileControls(width, height);

        // Таймер
        this.timerText.setText('Time: 0');
        this.timeSurvived = 0;

        // Кнопки
        this.restartButton = this.add.text(width / 2, height / 2, 'RESTART COLHOZNIK', {
            fontSize: '7vw',
        }).setOrigin(0.5, 0.5).setVisible(false);

        this.restartButton.setInteractive().on('pointerdown', () => {
            this.restartGame();
        });

        this.nextLevelButton = this.add.text(width / 2, height / 2, 'Next COLHOZNIK fight', {
            fontSize: '7vw',
        }).setOrigin(0.5, 0.5).setVisible(false);

        this.nextLevelButton.setInteractive().on('pointerdown', () => {
            this.startNextLevel();
        });

        // Уровень
        this.levelText.setText(`Level: ${this.level}`);

        // События
        this.spawnEvent = this.time.addEvent({
            delay: 1000,
            callback: this.spawnFallingObject,
            callbackScope: this,
            loop: true
        });

        this.timeEvent = this.time.addEvent({
            delay: 1000,
            callback: this.updateTime,
            callbackScope: this,
            loop: true
        });

        this.nextLevelEvent = this.time.addEvent({
            delay: 20000,
            callback: this.showNextLevelButton,
            callbackScope: this,
            loop: true
        });
    }

    private spawnFallingObject(): void {
        const xPosition = Phaser.Math.Between(50, this.cameras.main.width - 50);
        const fallingObject = this.add.sprite(xPosition, 0, 'enemy');
        fallingObject.setScale(0.5);
        this.fallingObjects.add(fallingObject);
    }

    private updateTime(): void {
        if (!this.gameOver) {
            this.timeSurvived++;
            this.timerText.setText(`Time: ${this.timeSurvived} seconds`);
        }
    }

    private restartGame(): void {
        this.gameOver = false;
        this.timeSurvived = 0;
        this.level = 1;
        this.enemySpeed = 5;
        this.fallingObjects.clear(true, true);
        this.restartButton.setVisible(false);
        this.nextLevelButton.setVisible(false);
        this.levelText.setText(`Level: ${this.level}`);
        this.spawnEvent.paused = false;
        this.timerText.setText('Time: 0');
        this.timeEvent.reset({ delay: 1000, callback: this.updateTime, callbackScope: this, loop: true });
        this.nextLevelEvent.reset({
            delay: 20000,
            callback: this.showNextLevelButton,
            callbackScope: this,
            loop: true
        });
    }

    private showNextLevelButton(): void {
        if (!this.gameOver) {
            this.nextLevelButton.setVisible(true);
            this.spawnEvent.paused = true;
            this.timeEvent.paused = true;
        }
    }

    private startNextLevel(): void {
        this.level++;
        this.enemySpeed += 0.3;
        this.levelText.setText(`Level: ${this.level}`);
        this.nextLevelButton.setVisible(false);
        this.spawnEvent.paused = false;
        this.timeEvent.paused = false;
    }

    private createMobileControls(width: number, height: number): void {
        // Проверка, является ли устройство мобильным (ширина экрана меньше 768px)
        const isMobile = width < 768;

        if (isMobile) {
            // Добавляем возможность перетаскивания для мобильных устройств
            // @ts-ignore
            this.input.on('pointermove', (pointer) => {
                if (pointer.isDown) {
                    const pointerX = pointer.x;
                    // Обновляем позицию игрока в зависимости от движения пальца
                    this.player.x = Phaser.Math.Clamp(pointerX, 50, this.cameras.main.width - 50);
                }
            });
        } else if(this.input.keyboard) {
            // Инициализация стрелочек для больших экранов
            this.cursors = this.input.keyboard.createCursorKeys();
        }
    }

    private movePlayerLeft(): void {
        if (this.player.x > 50) { // Ограничиваем движение влево
            this.player.x -= 10;
        }
    }

    private movePlayerRight(): void {
        if (this.player.x < this.cameras.main.width - 50) { // Ограничиваем движение вправо
            this.player.x += 10;
        }
    }
}

const config: Phaser.Types.Core.GameConfig = {
    type: Phaser.AUTO,
    width: '100%',
    height: '100%',
    scene: GameScene,
    parent: 'game-container',
    scale: {
        mode: Phaser.Scale.RESIZE,
        autoCenter: Phaser.Scale.CENTER_BOTH
    }
};

new Phaser.Game(config);
