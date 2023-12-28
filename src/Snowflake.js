import { Engine, Render, Composite, Body, Events, Detector } from 'matter-js';

class Snowflake {
	constructor(x, y, radius, body) {
		body.collisionFilter = {
			category: 0x0001,
			mask: 0x0001,
		};
		this.x = x;
		this.y = y;
		this.size = radius;
		this.active = false;
		this.accel = { x: 0, y: 0 };
		this.body = body;
	}

	updatePosition() {
		this.x = this.body.position.x;
		this.y = this.body.position.y;
	}
}

class SnowflakePhysics {
	constructor(gravity = { x: 0, y: 1 }) {
		// Matter.Engine 생성
		this.engine = Engine.create();
		this.engine.gravity = gravity;

		// Matter.Render 생성 (optional)
		this.render = Render.create({
			element: document.body,
			engine: this.engine,
		});

		const collisionFilter = {
			category: 0x0001,
			mask: 0x0001,
		};

		// 눈덩이 그룹을 나타내는 Matter.World 생성
		this.world = this.engine.world;

		console.log('World', this.world);

		Render.run(this.render);
	}

	// 눈덩이를 Matter.World에 추가하는 함수
	addSnowflake(snowflake) {
		console.log('add!', snowflake.body.position);
		Composite.add(this.world, snowflake.body);
	}

	// 업데이트 함수
	update() {
		Engine.update(this.engine);
	}

	setGravity(num) {
		this.gravity = num;
	}

	updateSnowflakePosition(snowflake) {
		const newPosition = snowflake.body.position;
		snowflake.x = newPosition.x;
		snowflake.y = newPosition.y;
	}
}

const GRAVITY_ADJUST = 0.001;
const MOVE_ADJUST = 0.01;

class SnowflakeStore {
	constructor() {
		this.snowflakes = [];
		this.max_count = 500;
		this.initial_count = 200;
		this.wind = 0;
		this.gravity = 0.1;
		this.physics = new SnowflakePhysics({ x: 0, y: this.gravity });

		this.createInitialSnowflakes();

		// 충돌 이벤트 핸들러 등록
		Events.on(this.physics.engine, 'collisionStart', (event) => {
			event.pairs.forEach((pair) => {
				if (
					pair.bodyA.label === 'snowflake' &&
					pair.bodyB.label === 'snowflake'
				) {
					const snowflakeA = this.getSnowflakeByBody(pair.bodyA);
					const snowflakeB = this.getSnowflakeByBody(pair.bodyB);

					if (snowflakeA.active && snowflakeB.active) {
						// 반대 방향의 힘을 주어 충돌 효과를 만듦
						const forceX = -(Math.random() * 1 - 0.5) * MOVE_ADJUST;
						const forceY = -this.gravity * GRAVITY_ADJUST;

						// 각 눈송이에 반대 방향으로 힘을 적용
						Body.applyForce(snowflakeA.body, snowflakeA.body.position, {
							x: forceX,
							y: forceY,
						});

						Body.applyForce(snowflakeB.body, snowflakeB.body.position, {
							x: -forceX,
							y: -forceY,
						});
					}
				}
			});
		});
	}
	// Matter.Events.off를 사용하여 리스너 제거 (선택 사항)
	removeCollisionListener() {
		Events.off(this.physics.engine, 'collisionStart');
	}

	// Matter.js의 Body를 통해 눈송이 객체 얻기
	getSnowflakeByBody(body) {
		return this.snowflakes.find((snowflake) => snowflake.body === body);
	}

	setWind(num) {
		if (!num) {
			num = ((this.wind + 3) % 5) - 2;
		}
		this.wind = num;
	}

	setGravity(num) {
		if (!num) {
			num = ((this.gravity + 1) % 5) + 1;
		}
		this.gravity = num;
	}

	createSnowflake() {
		const x = Math.random() * window.innerWidth * 2 - window.innerWidth * 0.5;
		const y = -(Math.random() * window.innerHeight) / 8;
		const radius = Math.random() * 10 + 5;

		const snowflake = this.snowflakes.find((flake) => !flake.active);

		if (snowflake) {
			snowflake.x = x;
			snowflake.y = y;
			snowflake.size = radius;
			snowflake.active = true;
			snowflake.accel = { x: 0, y: 0 };
		} else {
			const body = Body.create({
				position: { x, y },
				circle: { radius },
				friction: 0.001,
				restitution: 0.5,
			});
			const snowflake = new Snowflake(x, y, radius, body);
			this.physics.addSnowflake(snowflake);
			this.snowflakes.push(snowflake);
		}
	}

	createInitialSnowflakes() {
		// 초기에 200개의 snowflake를 생성
		let count = this.max_count;
		let interval = 100;

		const shoot = () => {
			if (count <= 0) {
				clearInterval(intervalId);
				return;
			}
			count--;
			interval = 25 + Math.random() * 50;
			this.createSnowflake();
		};
		const intervalId = setInterval(() => {
			shoot();
		}, interval);
	}

	// SnowflakeStore 클래스 내에서
	updateSnowflakes() {
		this.snowflakes = this.snowflakes.map((snowflake, index) => {
			if (!snowflake.active) return snowflake;
			const tempflake = { ...snowflake };
			tempflake.updatePosition = snowflake.updatePosition;
			if (tempflake.active === true) {
				const forceX = (Math.random() * 1 - 0.5) * MOVE_ADJUST;
				const forceY = this.gravity * GRAVITY_ADJUST;

				// Matter.js를 사용하여 힘을 적용
				Body.applyForce(tempflake.body, tempflake.body.position, {
					x: forceX,
					y: forceY,
				});

				// Matter.js의 Body 위치를 화면에 표시되는 위치로 업데이트
				this.physics.updateSnowflakePosition(tempflake);

				// flakes 객체의 위치 업데이트
				tempflake.updatePosition();

				// 눈송이가 화면 밖으로 벗어나면 비활성화
				if (tempflake.y > window.innerHeight * 0.9) {
					tempflake.active = 'stay';
				}
			}
			return tempflake;
		});

		this.physics.update();
	}
}

const snowflakeStore = new SnowflakeStore();
export default snowflakeStore;
