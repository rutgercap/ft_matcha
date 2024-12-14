# A little Makefile that synthetize the project related commands

NAME := dev

DOCKER := docker compose -f docker-compose.dev.yml
DB_PATH := ./database



all: ${NAME}

migrate:
	${DOCKER} exec matcha pnpm run db:migrate

dev :
	${DOCKER} up --build

fake_users:
	${DOCKER} exec matcha pnpm run script:fake_users -- --num=${num}

down :
	${DOCKER} down

test :
	${DOCKER} exec matcha pnpm run test:unit 


prune : down
	docker system prune -a --volumes -f

db-clean :
	rm -rf ${DB_PATH}/database.db
	rm -rf ${DB_PATH}/migrations.lock
	find ./profile-pictures -type f ! -name "default*" -delete

