@echo off
title Ruhunu Farm Pro - Prisma Database Studio
color 0B

echo Opening Prisma Database Studio...
cd /d %~dp0backend
start "" http://localhost:5555
npx prisma studio --port 5555
