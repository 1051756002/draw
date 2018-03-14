@echo off

if not exist db (
	mkdir db
)

if not exist log (
	mkdir log
)

rem mongod --remove
"C:/Program Files/MongoDB/Server/3.4/bin/mongod.exe" --config "E:/project-git/draw/draw-data/mongodb.conf" --install

rem @echo on

rem mongod --config ./mongodb.conf
