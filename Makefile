# A little Makefile that synthetize the project related commands

NAME := dev

DOCKER := docker compose -f docker-compose.dev.yml

all : ${NAME}

dev : 
	${DOCKER} up --build

down :
	${DOCKER} down

test :
	${DOCKER} exec matcha pnpm run test:unit

prune : down
	docker system prune -a --volumes -f

